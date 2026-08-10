import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listSiteContentVersions } from "@/lib/admin/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const versions = await listSiteContentVersions(100);
  return NextResponse.json({ ok: true, versions });
}
