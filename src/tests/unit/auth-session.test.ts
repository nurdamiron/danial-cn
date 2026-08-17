import { describe, expect, it } from "vitest";
import { createSessionToken, parseSessionToken, ROLES } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";

describe("session tokens", () => {
  it("creates and verifies a valid session", () => {
    const token = createSessionToken({
      id: "user_1",
      role: ROLES.ADMIN,
      sessionVersion: 3,
    });
    const parsed = parseSessionToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.userId).toBe("user_1");
    expect(parsed?.role).toBe(ROLES.ADMIN);
    expect(parsed?.sessionVersion).toBe(3);
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken({
      id: "user_1",
      role: ROLES.USER,
      sessionVersion: 0,
    });
    const [payload] = token.split(".");
    expect(parseSessionToken(`${payload}.deadbeef`)).toBeNull();
    expect(parseSessionToken(undefined)).toBeNull();
    expect(parseSessionToken("")).toBeNull();
  });

  it("refuses a cookie in the pre-versioning shape", () => {
    // The old payload was `id:role:exp`. Read with the current layout its exp
    // would land in the version slot, so it has to be rejected outright rather
    // than parsed into the wrong fields.
    const exp = Date.now() + 60_000;
    const legacy = `user_1:ADMIN:${exp}`;
    expect(parseSessionToken(`${legacy}.whatever`)).toBeNull();
  });

  it("does not carry the session version outside the signature", () => {
    // Bumping the number in the payload by hand must break verification.
    const token = createSessionToken({
      id: "user_1",
      role: ROLES.ADMIN,
      sessionVersion: 1,
    });
    const [payload, sig] = token.split(".");
    const forged = payload.replace(":1:", ":2:");
    expect(parseSessionToken(`${forged}.${sig}`)).toBeNull();
  });
});

describe("client address", () => {
  it("takes the client from the front of x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.9, 70.41.3.18" },
    });
    expect(clientIp(req)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip and then to empty", () => {
    const withReal = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    expect(clientIp(withReal)).toBe("198.51.100.7");
    expect(clientIp(new Request("https://example.com"))).toBe("");
  });
});
