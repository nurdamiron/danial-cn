/**
 * Host helpers for splitting storefront vs admin.
 *
 * Note: Vercel does NOT allow custom subdomains under *.vercel.app
 * (e.g. admin.danial-cn.vercel.app is invalid).
 * Free options:
 *  - second project → https://admin-danial-cn.vercel.app
 *  - own domain → https://admin.yourdomain.kz
 */

function splitHosts(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
    .map((h) => h.replace(/^https?:\/\//, "").replace(/\/$/, ""));
}

/** Hostnames that serve only the admin app */
export function getAdminHosts(): string[] {
  const fromEnv = splitHosts(
    process.env.ADMIN_HOSTS || process.env.NEXT_PUBLIC_ADMIN_HOSTS,
  );
  const defaults = [
    // requested (won't work on vercel.app DNS — kept for local/custom DNS experiments)
    "admin.danial-cn.vercel.app",
    // recommended free Vercel project name
    "admin-danial-cn.vercel.app",
    // local
    "admin.localhost",
    "admin.localhost:3000",
    "admin.127.0.0.1",
    "admin.127.0.0.1:3000",
  ];
  return [...new Set([...fromEnv, ...defaults])];
}

export function normalizeHost(host: string | null): string {
  if (!host) return "";
  return host.toLowerCase().trim();
}

export function isAdminHost(host: string | null): boolean {
  const h = normalizeHost(host);
  if (!h) return false;
  const hosts = getAdminHosts();
  if (hosts.includes(h)) return true;
  // compare without port
  const bare = h.split(":")[0];
  return hosts.some((a) => a === bare || a.split(":")[0] === bare);
}

/** Public store origin (no trailing slash) */
export function getStoreOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://danial-cn.vercel.app"
  );
}

/**
 * The shop's own address, when the request arrived somewhere else.
 *
 * A deployment answers on its vercel.app URLs as well as on the real domain,
 * and a second copy of a shop is not free. Search engines index whichever one
 * they find, and — the reason this is an auth fix — a session cookie is set
 * per origin: a customer who followed a password-reset link to the vercel.app
 * copy was signed in there and came back to the shop still a guest.
 *
 * Returns null when the request is already in the right place, so the caller
 * can leave it alone.
 */
export function canonicalRedirectOrigin(input: {
  host: string | null;
  /** The admin app is a separate host on purpose and is never moved. */
  adminHost: boolean;
  /** NEXT_PUBLIC_SITE_URL, exactly as configured. */
  siteUrl: string | undefined;
  /** Only the production alias is canonicalised; previews keep their URLs. */
  vercelEnv: string | undefined;
}): string | null {
  if (input.adminHost) return null;
  if (input.vercelEnv !== "production") return null;

  // Only an explicitly configured address is worth redirecting to. Acting on
  // the fallback in getStoreOrigin() would send a plain deployment to a host
  // its owner never claimed, and the shop would be unreachable.
  const configured = input.siteUrl?.trim();
  if (!configured) return null;

  let target: URL;
  try {
    target = new URL(configured);
  } catch {
    return null;
  }

  const host = normalizeHost(input.host);
  if (!host || host === target.host.toLowerCase()) return null;

  return `${target.protocol}//${target.host}`;
}

/** Admin origin (no trailing slash) */
export function getAdminOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "") ||
    process.env.ADMIN_URL?.replace(/\/$/, "") ||
    "https://admin-danial-cn.vercel.app"
  );
}

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/auth")
  );
}
