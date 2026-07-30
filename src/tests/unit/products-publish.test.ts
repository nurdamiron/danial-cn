import { describe, it, expect } from "vitest";
import { canPublishProduct } from "@/lib/publish";

describe("canPublishProduct", () => {
  it("blocks zero images", () => {
    expect(canPublishProduct({ imageCount: 0 }).ok).toBe(false);
  });
  it("allows one or more images", () => {
    expect(canPublishProduct({ imageCount: 1 }).ok).toBe(true);
  });
});
