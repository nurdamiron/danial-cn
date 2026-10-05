import { describe, expect, it } from "vitest";
import { z } from "zod";
import { firstIssueMessage } from "@/lib/validation-message";

const schema = z.object({
  nameRu: z.string().min(1),
  basePriceKzt: z.number().int().positive(),
  email: z.string().email(),
  status: z.enum(["draft", "active"]).optional(),
  city: z.string().min(1, "Укажите город"),
});

const base = {
  nameRu: "A",
  basePriceKzt: 1,
  email: "a@b.cd",
  city: "Алматы",
};

function msg(input: unknown) {
  const r = schema.safeParse(input);
  if (r.success) throw new Error("expected failure");
  return firstIssueMessage(r.error);
}

describe("firstIssueMessage", () => {
  it("names the field in Russian", () => {
    expect(msg({ ...base, nameRu: "" })).toBe("Название: заполните поле");
    expect(msg({ ...base, basePriceKzt: 0 })).toBe(
      "Цена: должно быть больше 0",
    );
    expect(msg({ ...base, email: "x" })).toBe("Email: неверный формат");
    expect(msg({ ...base, status: "x" })).toBe("Статус: недопустимое значение");
    expect(msg({ ...base, basePriceKzt: undefined })).toBe(
      "Цена: заполните поле",
    );
  });

  it("keeps a schema's own Russian message", () => {
    expect(msg({ ...base, city: "" })).toBe("Укажите город");
  });
});
