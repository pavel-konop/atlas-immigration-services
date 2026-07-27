import crypto from "node:crypto";

/**
 * Best-effort in-memory IP rate limiter.
 *
 * IMPORTANT CAVEAT: this state lives in the process. On serverless/edge hosting
 * it is per-instance and evaporates on cold start, so it does NOT provide a
 * global limit across instances — it only blunts a burst hitting one instance.
 * The durable per-conversation limit is the DB turn cap in handleChat; for real
 * distributed rate limiting use a shared store (Upstash/Vercel KV) or edge
 * middleware. Keep this as a cheap first line of defense only.
 */

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 20;

const hits = new Map<string, number[]>();

/** Returns true if the request is allowed, false if the window is exceeded. */
export function checkRateLimit(key: string, now: number): boolean {
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/**
 * Salted hash of a client IP for PDPA-minimal storage / rate-limit keying.
 * The salt (VISITOR_HASH_SALT) keeps hashes non-reversible across deployments;
 * a default is used if unset so local dev works.
 */
export function hashVisitorIp(ip: string): string {
  const salt = process.env.VISITOR_HASH_SALT || "atlas-visitor-salt";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
