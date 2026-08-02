import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  parseSessionToken,
  ROLES,
} from "@/lib/auth";

describe("session tokens", () => {
  it("creates and verifies a valid session", () => {
    const token = createSessionToken({
      id: "user_1",
      role: ROLES.ADMIN,
    });
    const parsed = parseSessionToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.userId).toBe("user_1");
    expect(parsed?.role).toBe(ROLES.ADMIN);
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken({ id: "user_1", role: ROLES.USER });
    const [payload] = token.split(".");
    expect(parseSessionToken(`${payload}.deadbeef`)).toBeNull();
    expect(parseSessionToken(undefined)).toBeNull();
    expect(parseSessionToken("")).toBeNull();
  });
});
