import { describe, it, expect } from "vitest";
import { validateImageFile } from "@/lib/images";

const MB = 1024 * 1024;

describe("validateImageFile", () => {
  it("rejects anything that is not an image", () => {
    expect(() =>
      validateImageFile({ type: "application/pdf", size: 100 }),
    ).toThrow();
  });

  it("rejects a file over the limit", () => {
    expect(() =>
      validateImageFile({ type: "image/jpeg", size: 13 * MB }),
    ).toThrow();
  });

  it("accepts a photo straight off a phone", () => {
    // The limit is 12 MB rather than something tidier because the shop's
    // photography arrives from a phone camera, and those routinely run to
    // eight or ten.
    expect(() =>
      validateImageFile({ type: "image/jpeg", size: 10 * MB }),
    ).not.toThrow();
    expect(() =>
      validateImageFile({ type: "image/heic", size: 1024 }),
    ).toThrow();
  });

  it("accepts the formats the admin panel offers", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/avif"]) {
      expect(() => validateImageFile({ type, size: 1024 })).not.toThrow();
    }
  });
});
