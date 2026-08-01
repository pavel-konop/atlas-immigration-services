import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { recordCtaClick } from "@/lib/ai/database/repositories";

// pg requires the Node.js runtime.
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fire-and-forget CTA-click beacon from the chat widget. Accepts only a session
 * id (validated as a UUID; the DB write additionally requires it to be a real,
 * recent session). Always returns 204 so the client never waits on or branches
 * over analytics — the WhatsApp handoff must not be delayed. See
 * `recordCtaClick` for the narrow, idempotent write.
 */
export async function POST(request: Request) {
  if (isDatabaseConfigured()) {
    try {
      const body = (await request.json().catch(() => null)) as { sessionId?: unknown } | null;
      const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
      if (UUID_RE.test(sessionId)) {
        await recordCtaClick(sessionId);
      }
    } catch {
      // Never surface analytics errors to the client.
    }
  }
  return new NextResponse(null, { status: 204 });
}
