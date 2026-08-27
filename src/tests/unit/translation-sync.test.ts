import { describe, expect, it } from "vitest";
import { syncTranslation, syncProductTranslations } from "@/lib/translation-sync";

describe("syncTranslation", () => {
  it("fills an empty translation with the Russian text", () => {
    expect(syncTranslation({ prevRu: "Старое", nextRu: "Новое", kk: "" })).toBe(
      "Новое",
    );
  });

  it("follows the Russian when the two were the same word", () => {
    // Nobody translated this one — it was mirrored, so it keeps mirroring.
    expect(
      syncTranslation({ prevRu: "Старое", nextRu: "Новое", kk: "Старое" }),
    ).toBe("Новое");
  });

  it("keeps a real translation when the Russian changes", () => {
    // Someone wrote this in Kazakh. Editing the Russian must not throw it away.
    expect(
      syncTranslation({
        prevRu: "Анодированный алюминий",
        nextRu: "Анодированный алюминий, матовый",
        kk: "Анодталған алюминий",
      }),
    ).toBe("Анодталған алюминий");
  });

  it("leaves a real translation alone when the Russian did not change", () => {
    expect(
      syncTranslation({
        prevRu: "Алюминий",
        nextRu: "Алюминий",
        kk: "Алюминий қорытпасы",
      }),
    ).toBe("Алюминий қорытпасы");
  });

  it("ignores surrounding whitespace when deciding if it was a mirror", () => {
    expect(
      syncTranslation({ prevRu: "Старое", nextRu: "Новое", kk: "  Старое  " }),
    ).toBe("Новое");
  });

  it("treats a whitespace-only translation as empty", () => {
    expect(
      syncTranslation({ prevRu: "Старое", nextRu: "Новое", kk: "   " }),
    ).toBe("Новое");
  });
});

describe("syncProductTranslations", () => {
  const before = {
    nameRu: "Aluma Cabin 55",
    nameKk: "Aluma Cabin 55",
    descriptionRu: "Цельный алюминиевый корпус.",
    descriptionKk: "Тұтас алюминий корпус.",
    materialRu: "Анодированный алюминий",
    materialKk: "Анодталған алюминий",
  };

  it("mirrors the fields nobody translated and keeps the ones somebody did", () => {
    const out = syncProductTranslations(before, {
      nameRu: "Aluma Cabin 55 Pro",
      descriptionRu: "Цельный алюминиевый корпус, новая ручка.",
      materialRu: "Анодированный алюминий",
    });

    // The name was a copy, so it follows.
    expect(out.nameKk).toBe("Aluma Cabin 55 Pro");
    // The other two are real translations: absent from the patch is how this
    // says "leave the stored value alone".
    expect(out).not.toHaveProperty("descriptionKk");
    expect(out).not.toHaveProperty("materialKk");
  });

  it("says nothing about fields the edit did not touch", () => {
    const out = syncProductTranslations(before, { materialRu: "Поликарбонат" });
    expect(out.nameKk).toBeUndefined();
    expect(out.descriptionKk).toBeUndefined();
    // materialKk was a real translation, so it survives an unrelated edit too.
    expect(out.materialKk).toBeUndefined();
  });

  it("returns nothing at all when only non-text fields changed", () => {
    expect(syncProductTranslations(before, {})).toEqual({});
  });

  it("never lets an explicit Kazakh value be overwritten", () => {
    // The translation disclosure is still there; what it sends wins.
    const out = syncProductTranslations(before, {
      nameRu: "Новое имя",
      nameKk: "Жаңа атау",
    });
    expect(out.nameKk).toBeUndefined();
  });
});
