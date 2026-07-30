import { describe, it, expect } from "vitest";
import { formatKzt } from "@/lib/money";

describe("formatKzt", () => {
  it("formats with spaces and tenge", () => {
    expect(formatKzt(89000)).toBe("89 000 ₸");
    expect(formatKzt(1_290_000)).toBe("1 290 000 ₸");
  });
});
