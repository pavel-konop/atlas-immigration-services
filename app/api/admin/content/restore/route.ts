import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { restoreSiteContentVersion } from "@/lib/admin/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { version?: number } | null;
  if (typeof body?.version !== "number") {
    return NextResponse.json({ ok: false, message: "Missing version." }, { status: 422 });
  }

  const result = await restoreSiteContentVersion(body.version);
  if (!result.ok) {
    return result.notFound
      ? NextResponse.json({ ok: false, message: "That version no longer exists." }, { status: 404 })
      : NextResponse.json({ ok: false, message: "Could not restore right now — please try again." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, content: result.content, version: result.version });
}
