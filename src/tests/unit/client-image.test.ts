import { describe, expect, it } from "vitest";
import { UPLOAD_MAX_EDGE, fitWithin } from "@/lib/client-image";

describe("fitWithin", () => {
  it("leaves a photo that already fits alone", () => {
    expect(fitWithin(1200, 900, 2400)).toEqual({ width: 1200, height: 900 });
  });

  it("shrinks by the longer edge, keeping the shape", () => {
    expect(fitWithin(4000, 3000, 2400)).toEqual({ width: 2400, height: 1800 });
    expect(fitWithin(3000, 4000, 2400)).toEqual({ width: 1800, height: 2400 });
  });

  it("handles a square", () => {
    expect(fitWithin(5000, 5000, 2400)).toEqual({ width: 2400, height: 2400 });
  });

  it("never rounds an edge down to nothing", () => {
    // A panorama: the short edge would round to 0 at plain proportions.
    const out = fitWithin(20000, 30, 2400);
    expect(out.width).toBe(2400);
    expect(out.height).toBeGreaterThanOrEqual(1);
  });

  it("returns whole pixels", () => {
    const out = fitWithin(4001, 3001, 2400);
    expect(Number.isInteger(out.width)).toBe(true);
    expect(Number.isInteger(out.height)).toBe(true);
  });

  it("survives a zero or missing dimension rather than dividing by it", () => {
    expect(fitWithin(0, 0, 2400)).toEqual({ width: 0, height: 0 });
  });

  it("matches the edge the server would resize to anyway", () => {
    // lib/images.ts caps at 2400; sending more is bytes the server discards.
    expect(UPLOAD_MAX_EDGE).toBe(2400);
  });
});
