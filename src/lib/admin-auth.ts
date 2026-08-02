/**
 * Compatibility layer — admin auth now uses user sessions + roles.
 * Prefer importing from @/lib/auth in new code.
 */
export {
  isAdminAuthenticated,
  requireAdmin,
  SESSION_COOKIE as ADMIN_COOKIE,
  createSessionToken,
  parseSessionToken as verifySessionTokenRaw,
} from "@/lib/auth";

import { parseSessionToken } from "@/lib/auth";

/** Legacy boolean token check (kept for old cookie shapes). */
export function verifySessionToken(token: string | undefined): boolean {
  return Boolean(parseSessionToken(token));
}
