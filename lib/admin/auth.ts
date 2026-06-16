import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "atlas_admin_session";

function adminSecret() {
  return process.env.ADMIN_PASSWORD || "atlas-admin";
}

export function adminToken() {
  return createHash("sha256").update(`atlas:${adminSecret()}`).digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expected = Buffer.from(adminSecret());
  const received = Buffer.from(password);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(adminCookieName)?.value === adminToken();
}
