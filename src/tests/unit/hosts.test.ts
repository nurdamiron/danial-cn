import { describe, expect, it } from "vitest";
import {
  canonicalRedirectOrigin,
  isAdminHost,
  isAdminPath,
} from "@/lib/hosts";

const SHOP = "https://www.danial-cn.kz";

/** A production request, unless the case says otherwise. */
function redirect(overrides: Partial<Parameters<typeof canonicalRedirectOrigin>[0]>) {
  return canonicalRedirectOrigin({
    host: "danial-cn.vercel.app",
    adminHost: false,
    siteUrl: SHOP,
    vercelEnv: "production",
    ...overrides,
  });
}

describe("hosts", () => {
  it("detects admin hosts", () => {
    expect(isAdminHost("admin-danial-cn.vercel.app")).toBe(true);
    expect(isAdminHost("admin.danial-cn.vercel.app")).toBe(true);
    expect(isAdminHost("admin.localhost:3000")).toBe(true);
    expect(isAdminHost("danial-cn.vercel.app")).toBe(false);
    expect(isAdminHost("localhost:3000")).toBe(false);
  });

  it("detects admin paths", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/login")).toBe(true);
    expect(isAdminPath("/api/admin/products")).toBe(true);
    expect(isAdminPath("/api/auth/login")).toBe(true);
    expect(isAdminPath("/ru/catalog")).toBe(false);
  });
});

describe("canonicalRedirectOrigin", () => {
  it("sends the deployment's own URLs to the shop's address", () => {
    // The reason this exists: a reset link answered here set the session
    // cookie on vercel.app, and the customer returned to the shop signed out.
    expect(redirect({ host: "danial-cn.vercel.app" })).toBe(SHOP);
    expect(redirect({ host: "danial-bokfjku2z-nurdaulet.vercel.app" })).toBe(SHOP);
  });

  it("moves the bare domain onto the configured www", () => {
    expect(redirect({ host: "danial-cn.kz" })).toBe(SHOP);
  });

  it("leaves a request that is already in the right place", () => {
    expect(redirect({ host: "www.danial-cn.kz" })).toBeNull();
    expect(redirect({ host: "WWW.DANIAL-CN.KZ" })).toBeNull();
  });

  it("never moves the admin host", () => {
    expect(redirect({ host: "admin-danial-cn.vercel.app", adminHost: true })).toBeNull();
  });

  it("leaves previews and local runs alone", () => {
    expect(redirect({ vercelEnv: "preview" })).toBeNull();
    expect(redirect({ vercelEnv: undefined, host: "localhost:3000" })).toBeNull();
  });

  it("does nothing without an address it was actually given", () => {
    // Acting on the fallback would bounce a plain deployment to a host nobody
    // claimed, and the shop would be unreachable.
    expect(redirect({ siteUrl: undefined })).toBeNull();
    expect(redirect({ siteUrl: "   " })).toBeNull();
    expect(redirect({ siteUrl: "not a url" })).toBeNull();
  });

  it("does nothing when the host header is missing", () => {
    expect(redirect({ host: null })).toBeNull();
  });
});
