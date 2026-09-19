import { describe, it, expect } from "vitest";
import { productSlugBase, slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("transliterates Russian to a latin slug", () => {
    expect(slugify("Чемодан Классик")).toBe("chemodan-klassik");
  });

  it("transliterates Kazakh-only letters", () => {
    expect(slugify("Әсем қоңыр")).toBe("asem-qonyr");
  });

  it("keeps latin names as they are", () => {
    expect(slugify("ALUMA Cabin")).toBe("aluma-cabin");
  });

  it("drops punctuation instead of leaving separators behind", () => {
    expect(slugify("Rimowa — Original, 55 см!")).toBe("rimowa-original-55-sm");
  });

  it("collapses repeated and trailing dashes", () => {
    expect(slugify("  --Чемодан   Люкс--  ")).toBe("chemodan-lyuks");
  });

  it("caps the length at 60 characters without a trailing dash", () => {
    const slug = slugify("а".repeat(80));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("falls back to a usable slug when nothing transliterates", () => {
    expect(slugify("包 ✈")).toBe("product");
    expect(slugify("")).toBe("product");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when it is free", async () => {
    expect(await uniqueSlug("chemodan", async () => false)).toBe("chemodan");
  });

  it("suffixes until it finds a free slug", async () => {
    const taken = new Set(["chemodan", "chemodan-2", "chemodan-3"]);
    expect(await uniqueSlug("chemodan", async (s) => taken.has(s))).toBe(
      "chemodan-4",
    );
  });

  it("keeps the suffixed slug inside the 60 character cap", async () => {
    const base = "a".repeat(60);
    const result = await uniqueSlug(base, async (s) => s === base);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith("-2")).toBe(true);
  });
});

describe("productSlugBase", () => {
  it("puts the brand in front of the name", () => {
    expect(productSlugBase("ALUMA", "Классик")).toBe("aluma-klassik");
  });

  it("does not repeat a brand the name already opens with", () => {
    expect(productSlugBase("ALUMA", "ALUMA Cabin")).toBe("aluma-cabin");
  });

  it("works when only one of the two is filled in", () => {
    expect(productSlugBase("", "Классик")).toBe("klassik");
    expect(productSlugBase("ALUMA", "")).toBe("aluma");
  });
});
