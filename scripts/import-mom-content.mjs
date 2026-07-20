import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const MOM_ORIGIN = "https://www.mom.gov.sg";
const SEED_URLS = [
  `${MOM_ORIGIN}/passes-and-permits`,
  `${MOM_ORIGIN}/employment-practices`,
  `${MOM_ORIGIN}/sitemap`
];
const ALLOWED_PREFIXES = ["/passes-and-permits", "/employment-practices"];
const USER_AGENT = "AtlasImmigrationServicesContentImporter/0.1 (+https://www.atlas-immi.com)";
const REQUEST_DELAY_MS = 250;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const maxPages = limitArg ? Number(limitArg.replace("--limit=", "")) : Number.POSITIVE_INFINITY;

loadEnv();

if (!dryRun && !process.env.DATABASE_URL) {
  fail("DATABASE_URL is required. Add it to .env or export it before running this script.");
}

const seen = new Set();
const queued = new Set(SEED_URLS.map((url) => normalizeUrl(url)).filter(Boolean));
const pages = [];
const failures = [];

while (queued.size > 0 && pages.length < maxPages) {
  const [url] = queued;
  queued.delete(url);

  if (seen.has(url)) continue;
  seen.add(url);

  try {
    const html = await fetchHtml(url);
    const links = extractLinks(html, url);
    for (const link of links) {
      if (!seen.has(link) && isAllowedUrl(link)) queued.add(link);
    }

    if (isAllowedUrl(url)) {
      const page = extractPage(url, html, links);
      if (page.rawContent.length >= 300) {
        pages.push(page);
        console.log(`+ ${pages.length} ${page.title} (${url})`);
      } else {
        failures.push({ url, reason: "Skipped: extracted text was too short" });
      }
    }
  } catch (error) {
    failures.push({ url, reason: error instanceof Error ? error.message : String(error) });
  }

  await delay(REQUEST_DELAY_MS);
}

pages.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));

if (dryRun) {
  console.log(`\nDry run complete: discovered ${pages.length} importable MOM pages.`);
  if (failures.length > 0) {
    console.log(`Skipped/failed: ${failures.length}`);
    for (const failure of failures.slice(0, 10)) {
      console.log(`- ${failure.url}: ${failure.reason}`);
    }
  }
  process.exit(0);
}

upsertPages(pages);
console.log(`\nImported ${pages.length} MOM pages into ai_content_intake.`);
if (failures.length > 0) {
  console.log(`Skipped/failed ${failures.length} URLs. First 10:`);
  for (const failure of failures.slice(0, 10)) {
    console.log(`- ${failure.url}: ${failure.reason}`);
  }
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1).replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  return response.text();
}

function extractPage(url, html, links) {
  const title = extractTitle(html) || titleFromUrl(url);
  const mainHtml = extractMainHtml(html);
  const rawContent = htmlToText(mainHtml);
  const contentHash = sha256(rawContent);
  const pathName = new URL(url).pathname;
  const section = pathName.startsWith("/passes-and-permits") ? "passes-and-permits" : "employment-practices";
  const lastUpdated = rawContent.match(/Last updated\s*:?\s*([^\n]+)/i)?.[1]?.trim() || null;

  return {
    sourceName: "Ministry of Manpower (MOM)",
    sourceType: "mom_page",
    sourceUrl: url,
    rawContent,
    metadata: {
      title,
      section,
      path: pathName,
      lastUpdated,
      contentHash,
      crawledAt: new Date().toISOString(),
      discoveredSameSectionLinks: links.filter(isAllowedUrl).length
    },
    title
  };
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const hrefPattern = /\bhref\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = hrefPattern.exec(html))) {
    const normalized = normalizeUrl(match[1], baseUrl);
    if (normalized) links.add(normalized);
  }

  return [...links];
}

function normalizeUrl(value, baseUrl = MOM_ORIGIN) {
  const href = decodeHtml(value).trim();
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return null;

  try {
    const url = new URL(href, baseUrl);
    if (url.hostname !== "www.mom.gov.sg") return null;
    url.protocol = "https:";
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return null;
  }
}

function isAllowedUrl(url) {
  const { pathname } = new URL(url);
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = h1 || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? cleanWhitespace(htmlToText(title).replace(/\|.*$/g, "")) : "";
}

function titleFromUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts.at(-1)?.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "MOM page";
}

function extractMainHtml(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (main) return main;
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  return body || html;
}

function htmlToText(html) {
  return cleanWhitespace(
    decodeHtml(
      html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|section|article|li|ul|ol|h[1-6]|tr|table|blockquote)>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

function cleanWhitespace(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtml(value) {
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " "
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    const normalized = String(code).toLowerCase();
    if (normalized.startsWith("#x")) return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    if (normalized.startsWith("#")) return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    return entities[normalized] || entity;
  });
}

function upsertPages(importPages) {
  if (importPages.length === 0) return;

  const csvPath = path.join(os.tmpdir(), `atlas-mom-import-${Date.now()}.csv`);
  const sqlPath = path.join(os.tmpdir(), `atlas-mom-import-${Date.now()}.sql`);

  fs.writeFileSync(csvPath, importPages.map(toCsvRow).join("\n") + "\n", "utf8");
  fs.writeFileSync(sqlPath, buildImportSql(csvPath), "utf8");

  try {
    const result = spawnSync("psql", [process.env.DATABASE_URL, "-v", "ON_ERROR_STOP=1", "-f", sqlPath], {
      stdio: "inherit"
    });

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  } finally {
    fs.rmSync(csvPath, { force: true });
    fs.rmSync(sqlPath, { force: true });
  }
}

function buildImportSql(csvPath) {
  const escapedPath = csvPath.replaceAll("'", "''");
  return `
CREATE TEMP TABLE mom_import (
  source_name text NOT NULL,
  source_type text NOT NULL,
  raw_content text NOT NULL,
  raw_mime_type text,
  source_url text NOT NULL,
  status text NOT NULL,
  metadata jsonb NOT NULL
);

\\copy mom_import (source_name, source_type, raw_content, raw_mime_type, source_url, status, metadata) FROM '${escapedPath}' WITH (FORMAT csv, HEADER false)

INSERT INTO ai_content_intake (
  source_name,
  source_type,
  raw_content,
  raw_mime_type,
  source_url,
  status,
  metadata
)
SELECT
  source_name,
  source_type,
  raw_content,
  raw_mime_type,
  source_url,
  status,
  metadata
FROM mom_import
ON CONFLICT (source_type, source_url) WHERE source_url IS NOT NULL
DO UPDATE SET
  source_name = EXCLUDED.source_name,
  raw_content = EXCLUDED.raw_content,
  raw_mime_type = EXCLUDED.raw_mime_type,
  status = CASE
    WHEN ai_content_intake.raw_content IS DISTINCT FROM EXCLUDED.raw_content THEN 'queued'
    ELSE ai_content_intake.status
  END,
  metadata = EXCLUDED.metadata,
  updated_at = now();
`;
}

function toCsvRow(page) {
  return [
    page.sourceName,
    page.sourceType,
    page.rawContent,
    "text/html",
    page.sourceUrl,
    "queued",
    JSON.stringify(page.metadata)
  ]
    .map(csvEscape)
    .join(",");
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
