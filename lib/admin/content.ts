import fs from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/types/admin-content";

const contentPath = path.join(process.cwd(), "content/admin/site-content.json");

export async function getSiteContent(): Promise<SiteContent> {
  const file = await fs.readFile(contentPath, "utf8");
  return JSON.parse(file) as SiteContent;
}

export async function saveSiteContent(content: SiteContent) {
  await fs.writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export function mergeServiceOverride<T extends { slug: string }>(service: T, content: SiteContent): T {
  return { ...service, ...content.serviceOverrides[service.slug] };
}

export function mergeArticleOverride<T extends { slug: string }>(article: T, content: SiteContent): T {
  return { ...article, ...content.articleOverrides[article.slug] };
}
