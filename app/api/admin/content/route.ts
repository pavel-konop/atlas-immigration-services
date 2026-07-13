import { NextResponse } from "next/server";
import { getSiteContent, normalizeSiteContent, saveSiteContent } from "@/lib/admin/content";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import type { SiteContent } from "@/types/admin-content";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, content: await getSiteContent() });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { content?: SiteContent } | null;
  if (!body?.content?.showcase || !body.content.audienceJourney || !body.content.contentLibrary || !body.content.faqs) {
    return NextResponse.json({ ok: false, message: "Invalid content payload." }, { status: 422 });
  }

  const normalized = normalizeSiteContent(body.content);
  await saveSiteContent(normalized);
  return NextResponse.json({ ok: true, content: normalized });
}
