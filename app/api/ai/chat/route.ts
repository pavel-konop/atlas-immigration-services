import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { handleChatTurn, MAX_MESSAGE_LENGTH } from "@/lib/ai/chat/handleChat";
import { checkRateLimit, hashVisitorIp } from "@/lib/ai/chat/rateLimit";

// pg requires the Node.js runtime (not edge).
export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "The assistant is not available right now." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;

  if (!message) {
    return NextResponse.json({ ok: false, message: "Please enter a message." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { ok: false, message: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 422 }
    );
  }

  const visitorHash = hashVisitorIp(clientIp(request));
  if (!checkRateLimit(visitorHash, Date.now())) {
    return NextResponse.json(
      { ok: false, message: "Too many messages. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const result = await handleChatTurn({
      sessionId,
      message,
      visitorHash,
      sourcePage: typeof body.sourcePage === "string" ? body.sourcePage : request.headers.get("referer"),
      locale: request.headers.get("accept-language"),
      userAgent: request.headers.get("user-agent")
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/ai/chat] turn failed", error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again or contact Atlas directly." },
      { status: 500 }
    );
  }
}
