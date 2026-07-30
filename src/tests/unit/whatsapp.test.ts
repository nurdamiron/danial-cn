import { describe, it, expect } from "vitest";
import { buildOrderMessage, buildWaUrl } from "@/lib/whatsapp";

const baseLabels = {
  title: "DANIAL CN — новый заказ",
  delivery: { cargo: "Карго", avia: "Авиа", express: "Экспресс" },
  replicaLine: "Danial CN · премиум-багаж",
  paymentNote: "Оплата: Kaspi (уточним в чате)",
  fields: {
    name: "Имя",
    city: "Город",
    phone: "Телефон",
    delivery: "Доставка",
    total: "Итого",
  },
};

describe("buildOrderMessage", () => {
  it("includes delivery, brand line, and total", () => {
    const msg = buildOrderMessage({
      locale: "ru",
      meta: { name: "Али", city: "Алматы", delivery: "express" },
      items: [
        {
          productId: "p1",
          variantId: "v1",
          slug: "alu-cabin",
          brand: "Alu",
          name: "Cabin 55",
          colorLabel: "Black",
          sizeLabel: "55",
          material: "PC",
          unitPriceKzt: 89000,
          qty: 1,
          imageUrl: "/x.jpg",
          productUrl: "http://localhost:3000/ru/catalog/alu-cabin",
        },
      ],
      labels: baseLabels,
    });
    expect(msg).toContain("Али");
    expect(msg).toContain("Алматы");
    expect(msg).toContain("Экспресс");
    expect(msg).toContain("премиум");
    expect(msg).toContain("89 000 ₸");
    expect(msg).toContain("Kaspi");
  });
});

describe("buildWaUrl", () => {
  it("encodes text param", () => {
    const url = buildWaUrl("77001112233", "hello world");
    expect(url).toBe("https://wa.me/77001112233?text=hello%20world");
  });
});
