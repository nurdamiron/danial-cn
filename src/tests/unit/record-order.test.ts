// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { recordOrder } from "@/lib/record-order";

const input = {
  locale: "ru",
  source: "cart" as const,
  meta: { name: "Иван", city: "Алматы", delivery: "express" as const },
  items: [
    {
      productId: "p1",
      variantId: "v1",
      slug: "chemodan",
      brand: "ALUMA",
      name: "Чемодан",
      colorLabel: "Чёрный",
      sizeLabel: "55",
      material: "Алюминий",
      unitPriceKzt: 100,
      qty: 1,
      imageUrl: "/x.jpg",
      productUrl: "https://example.kz/ru/catalog/chemodan",
    },
  ],
};

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("recordOrder", () => {
  it("reports the filed order when the shop accepted it", async () => {
    mockFetch(200, { order: { number: "DC-260826-ABCD", totalKzt: 100 } });
    const result = await recordOrder(input);
    expect(result.status).toBe("recorded");
    if (result.status !== "recorded") return;
    expect(result.order.number).toBe("DC-260826-ABCD");
  });

  it("reports a refused order as refused, with the reason", async () => {
    // The customer must not be handed to WhatsApp with a basket the shop has
    // already said it cannot fill.
    mockFetch(400, { error: "В наличии только 8 шт.: Чемодан" });
    const result = await recordOrder(input);
    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.error).toBe("В наличии только 8 шт.: Чемодан");
  });

  it("treats a server fault as the shop's problem, not the basket's", async () => {
    // A database hiccup should cost the shop its record, never the sale.
    mockFetch(500, {});
    expect((await recordOrder(input)).status).toBe("unavailable");
  });

  it("treats a dead network the same way", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect((await recordOrder(input)).status).toBe("unavailable");
  });

  it("does not claim a refusal it has no words for", async () => {
    mockFetch(400, {});
    const result = await recordOrder(input);
    expect(result.status).toBe("rejected");
    if (result.status !== "rejected") return;
    expect(result.error).toMatch(/[а-яА-ЯёЁ]/);
  });
});
