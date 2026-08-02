import { describe, expect, it } from "vitest";
import { isAdminHost, isAdminPath } from "@/lib/hosts";

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
