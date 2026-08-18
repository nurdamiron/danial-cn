/**
 * Password reset tokens.
 *
 * The link carries a long random string; the database keeps only its SHA-256.
 * Someone who reads this table therefore cannot use what they find, the same
 * reason passwords are not stored either.
 */
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const RESET_TTL_MINUTES = 60;
/** Requests one account can generate per hour, self-serve or admin-issued. */
export const MAX_RESETS_PER_HOUR = 5;

export function createResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time compare, so a lookup cannot be turned into a guessing oracle. */
export function resetTokenMatches(token: string, storedHash: string): boolean {
  const a = Buffer.from(hashResetToken(token));
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function resetExpiry(from = new Date()): Date {
  return new Date(from.getTime() + RESET_TTL_MINUTES * 60_000);
}

export function buildResetUrl(origin: string, token: string, locale = "ru"): string {
  return `${origin.replace(/\/$/, "")}/${locale}/reset?token=${encodeURIComponent(token)}`;
}
