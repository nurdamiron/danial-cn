import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Everything the pages need is served from this origin: next/font self-hosts
 * the typefaces at build time, product photography lives in /public, and there
 * are no third-party scripts. So the policy can name 'self' and stop there.
 *
 * 'unsafe-inline' stays for scripts because Next inlines its hydration payload
 * and there is no nonce plumbed through; dropping it would break the app
 * rather than harden it. Framing and plugins are refused outright.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" +
    (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Required for app/global-not-found.tsx, which is how a 404 is served now
  // that the storefront and the panel each have their own root layout.
  experimental: {
    globalNotFound: true,
  },
  images: {
    /*
      The catalogue is resized at build time into public/_img and served as
      plain static files — see scripts/optimize-images.mjs and
      src/lib/image-loader.ts.

      It used to go through Vercel's optimiser, which began answering 402 when
      the plan's transformation quota ran out: every product photograph on a
      775-image shop stopped loading at once. These stills never change
      between builds, so paying to transform them per request bought nothing
      even while the quota lasted.
    */
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Photos uploaded from the admin panel live in Vercel Blob; the loader
    // passes those through untouched.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
  },
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    // sharp is a native module: bundling it detaches the .node binary from
    // the libvips shared object it dlopens at runtime.
    "sharp",
  ],

  /**
   * Ship the whole of @img with the routes that resize photographs.
   *
   * sharp's platform package declares no dependency on its libvips sibling,
   * so nothing tells the tracer to carry libvips-cpp.so into the deployment.
   * Uploading then failed with "cannot open shared object file" — a 500 with
   * no body, on production only, because a developer machine has the file
   * sitting in node_modules the whole time.
   */
  outputFileTracingIncludes: {
    "/api/admin/products/**": ["./node_modules/@img/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default withNextIntl(nextConfig);
