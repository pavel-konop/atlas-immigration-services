import { NextResponse } from "next/server";
import {
  getCurrentSiteContentVersion,
  getSiteContent,
  saveSiteContentVersion
} from "@/lib/admin/content";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import type { SiteContent } from "@/types/admin-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  // Fresh (uncached) current version so the editor has an accurate concurrency base.
  const current = await getCurrentSiteContentVersion();
  const content = current?.content ?? (await getSiteContent());
  const version = current?.version ?? 0;
  return NextResponse.json({ ok: true, content, version });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Database is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { content?: SiteContent; baseVersion?: number; note?: string }
    | null;

  if (!body?.content?.showcase || !body.content.audienceJourney || !body.content.contentLibrary || !body.content.faqs) {
    return NextResponse.json({ ok: false, message: "Invalid content payload." }, { status: 422 });
  }
  if (typeof body.baseVersion !== "number") {
    return NextResponse.json({ ok: false, message: "Missing baseVersion." }, { status: 422 });
  }

  const result = await saveSiteContentVersion({
    content: body.content,
    baseVersion: body.baseVersion,
    note: body.note ?? null
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        conflict: true,
        currentVersion: result.currentVersion,
        message: "Someone else changed this content. Reload to get the latest version before saving."
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, content: result.content, version: result.version });
}
