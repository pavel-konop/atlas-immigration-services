import { NextResponse } from "next/server";
import { validateContactPayload } from "@/lib/forms/contact";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const result = validateContactPayload(body);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks. Atlas has received your enquiry details and will follow up shortly."
  });
}
