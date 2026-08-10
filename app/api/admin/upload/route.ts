import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getStorageAdapter } from "@/lib/storage";

// File writes (local driver) and the Blob SDK both want the Node runtime.
export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["photos", "articles"]);
// Defense in depth: the client always exports a cropped WebP capped at ~1600px
// long edge, which is comfortably under this — this just guards the route
// against anything that isn't going through the normal crop flow.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = form?.get("folder");

  if (!(file instanceof Blob) || typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ ok: false, message: "Invalid upload." }, { status: 422 });
  }
  if (file.type !== "image/webp") {
    return NextResponse.json({ ok: false, message: "Expected a cropped WebP image." }, { status: 422 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, message: "Image is too large." }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${crypto.randomUUID()}.webp`;
    const storage = getStorageAdapter();
    const stored = await storage.put(key, buffer, "image/webp");
    const url = storage.publicUrl(stored.key);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("[api/admin/upload]", error);
    return NextResponse.json({ ok: false, message: "Upload failed. Please try again." }, { status: 500 });
  }
}
