import { randomBytes, createHash } from "crypto";

export const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
