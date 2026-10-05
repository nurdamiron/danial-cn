import { describe, it, expect } from "vitest";
import { formatKzt } from "@/lib/money";

describe("formatKzt", () => {
  it("formats with spaces and tenge", () => {
    expect(formatKzt(89000)).toBe("89 000 ₸");
    expect(formatKzt(1_290_000)).toBe("1 290 000 ₸");
  });
});

describe("formatProductPrice", () => {
  it("quotes the one price when every size costs the same", async () => {
    const { formatProductPrice } = await import("@/lib/money");
    expect(
      formatProductPrice({ basePriceKzt: 100000, variants: [{ priceKzt: null }] }, "ru"),
    ).toBe("100 000 ₸");
  });

  it("quotes the cheapest variant with 'от' when sizes differ", async () => {
    const { formatProductPrice } = await import("@/lib/money");
    const product = {
      basePriceKzt: 100000,
      variants: [{ priceKzt: 120000 }, { priceKzt: 90000 }],
    };
    expect(formatProductPrice(product, "ru")).toBe("от 90 000 ₸");
    expect(formatProductPrice(product, "kk")).toBe("90 000 ₸ бастап");
  });
});
