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
