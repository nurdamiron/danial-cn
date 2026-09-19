import { describe, expect, it } from "vitest";
import { deriveSku, deriveVariant } from "@/lib/variant-defaults";

describe("deriveSku", () => {
  it("matches the shape the catalogue already uses", () => {
    // Every SKU in the shop reads slug-colour-size, upper case.
    expect(deriveSku("aluma-cabin-55", "champagne", "55")).toBe(
      "ALUMA-CABIN-55-CHAMPAGNE-55",
    );
  });

  it("keeps size keys that are words rather than numbers", () => {
    expect(deriveSku("vecta-set-3", "graphite", "set3")).toBe(
      "VECTA-SET-3-GRAPHITE-SET3",
    );
  });

  it("survives spaces and punctuation in a hand-typed colour", () => {
    expect(deriveSku("aluma-cabin-55", "тёмно синий", "55")).toBe(
      "ALUMA-CABIN-55-55",
    );
    expect(deriveSku("aluma-cabin-55", "rose gold", "55")).toBe(
      "ALUMA-CABIN-55-ROSE-GOLD-55",
    );
  });
});

describe("deriveVariant", () => {
  it("fills everything a palette colour and a preset size already know", () => {
    const v = deriveVariant({
      slug: "aluma-cabin-55",
      colorKey: "blush",
      sizeKey: "55",
    });
    expect(v).toMatchObject({
      sku: "ALUMA-CABIN-55-BLUSH-55",
      colorKey: "blush",
      colorLabelRu: "Пудровый",
      colorLabelKk: "Опалы қызғылт",
      colorHex: "#E5A9B8",
      sizeKey: "55",
      sizeLabelRu: "Ручная кладь 55 см",
      sizeLabelKk: "Қол жүгі 55 см",
    });
  });

  it("never overwrites something the caller spelled out", () => {
    const v = deriveVariant({
      slug: "aluma-cabin-55",
      colorKey: "blush",
      sizeKey: "55",
      sku: "CUSTOM-1",
      colorLabelRu: "Розовая пудра",
      colorHex: "#FFEEEE",
    });
    expect(v.sku).toBe("CUSTOM-1");
    expect(v.colorLabelRu).toBe("Розовая пудра");
    expect(v.colorHex).toBe("#FFEEEE");
    // Still filled in around the overrides.
    expect(v.sizeLabelRu).toBe("Ручная кладь 55 см");
  });

  it("falls back to the keys themselves for a colourway nobody has listed", () => {
    const v = deriveVariant({
      slug: "aluma-cabin-55",
      colorKey: "rose-gold",
      sizeKey: "90",
    });
    expect(v.colorLabelRu).toBe("rose-gold");
    expect(v.colorLabelKk).toBe("rose-gold");
    expect(v.sizeLabelRu).toBe("90");
    expect(v.sizeLabelKk).toBe("90");
    expect(v.colorHex).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("uses the Russian label for Kazakh when only the Russian one is given", () => {
    const v = deriveVariant({
      slug: "x",
      colorKey: "custom",
      sizeKey: "55",
      colorLabelRu: "Мятный",
    });
    expect(v.colorLabelKk).toBe("Мятный");
  });
});
