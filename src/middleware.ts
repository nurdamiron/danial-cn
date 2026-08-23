import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  canonicalRedirectOrigin,
  getAdminOrigin,
  getStoreOrigin,
  isAdminHost,
  isAdminPath,
} from "./lib/hosts";

const intlMiddleware = createMiddleware(routing);

function isAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/products") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;
  const adminMode = isAdminHost(host);

  // Assets are not localized, on either host. /icon and /apple-icon carry no
  // file extension, so the matcher does not exclude them and next-intl was
  // sending the favicon to /ru/icon, which is a 404 on every page of the site.
  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  // One shop, one address. Everything else this deployment answers on is sent
  // to the real domain, permanently: two live copies split the search ranking
  // between them, and split the session cookie too.
  const canonical = canonicalRedirectOrigin({
    host,
    adminHost: adminMode,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (canonical) {
    return NextResponse.redirect(
      new URL(pathname + req.nextUrl.search, canonical),
      308,
    );
  }

  // ——— Admin host (admin-danial-cn.vercel.app / admin.localhost) ———
  if (adminMode) {
    // / → /admin
    if (pathname === "/" || pathname === "") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Allow admin + auth APIs only
    if (isAdminPath(pathname)) {
      return NextResponse.next();
    }

    // Storefront locale routes on admin host → bounce to admin home
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // ——— Store host (danial-cn.vercel.app / localhost) ———
  // In production, send /admin* to the admin origin when configured.
  const adminOrigin = getAdminOrigin();
  const storeOrigin = getStoreOrigin();
  // The split only turns on when an admin origin was actually configured.
  // getAdminOrigin() has a built-in fallback, and auto-enabling on that
  // fallback would bounce /admin to a project that may not exist — leaving the
  // panel unreachable on a plain single-project deployment.
  const adminOriginConfigured = Boolean(
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || process.env.ADMIN_URL?.trim(),
  );
  const splitEnabled =
    process.env.ADMIN_HOST_SPLIT === "1" ||
    process.env.NEXT_PUBLIC_ADMIN_HOST_SPLIT === "1" ||
    (adminOriginConfigured &&
      (() => {
        try {
          return new URL(adminOrigin).host !== new URL(storeOrigin).host;
        } catch {
          return false;
        }
      })());

  // Only admin UI/API — keep /api/auth on the store for personal cabinet login
  if (
    splitEnabled &&
    process.env.NODE_ENV === "production" &&
    (pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname.startsWith("/api/admin"))
  ) {
    // Keep local same-origin if admin origin points at store (misconfig)
    try {
      const target = new URL(pathname + req.nextUrl.search, adminOrigin);
      if (target.host !== host) {
        return NextResponse.redirect(target);
      }
    } catch {
      // fall through
    }
  }

  // The admin app and the APIs are not localized. Without this next-intl
  // prefixes them — /api/auth/me becomes /ru/api/auth/me (the cabinet never
  // sees its session) and /admin/login becomes /ru/admin/login (404).
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return NextResponse.next();
  }

  // next-intl for locale-prefixed storefront
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static files already excluded loosely.
     * Admin host needs to catch `/` and `/admin` as well.
     */
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
