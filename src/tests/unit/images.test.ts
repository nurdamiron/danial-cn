import { describe, it, expect } from "vitest";
import { validateImageFile } from "@/lib/images";

describe("validateImageFile", () => {
  it("rejects non-image mime", () => {
    expect(() =>
      validateImageFile({ type: "application/pdf", size: 100 }),
    ).toThrow();
  });
  it("rejects oversize", () => {
    expect(() =>
      validateImageFile({ type: "image/jpeg", size: 9 * 1024 * 1024 }),
    ).toThrow();
  });
  it("accepts jpeg under limit", () => {
    expect(() =>
      validateImageFile({ type: "image/jpeg", size: 1024 }),
    ).not.toThrow();
  });
});
