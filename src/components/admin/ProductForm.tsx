"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductInput = {
  id?: string;
  slug: string;
  brand: string;
  nameRu: string;
  nameKk: string;
  descriptionRu: string;
  descriptionKk: string;
  materialRu: string;
  materialKk: string;
  category: string;
  basePriceKzt: number;
  heightCm?: number | null;
  widthCm?: number | null;
  depthCm?: number | null;
  volumeL?: number | null;
  weightKg?: number | null;
  wheels?: string | null;
  lockType?: string | null;
  status: string;
  featured: boolean;
};

const empty: ProductInput = {
  slug: "",
  brand: "",
  nameRu: "",
  nameKk: "",
  descriptionRu: "",
  descriptionKk: "",
  materialRu: "",
  materialKk: "",
  category: "cabin",
  basePriceKzt: 0,
  status: "draft",
  featured: false,
};

export function ProductForm({ product }: { product?: ProductInput }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(product ?? empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const isEdit = Boolean(product?.id);
      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            basePriceKzt: Number(form.basePriceKzt),
            heightCm: form.heightCm ? Number(form.heightCm) : null,
            widthCm: form.widthCm ? Number(form.widthCm) : null,
            depthCm: form.depthCm ? Number(form.depthCm) : null,
            volumeL: form.volumeL ? Number(form.volumeL) : null,
            weightKg: form.weightKg ? Number(form.weightKg) : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Ошибка сохранения (для публикации нужны фото)",
        );
        return;
      }
      if (!isEdit) {
        router.push(`/admin/products/${data.product.id}`);
      } else {
        setError("");
        setForm((f) => ({ ...f, ...data.product }));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function autoSlug() {
    if (product?.id) return;
    const base = form.nameRu || form.brand;
    if (!base) return;
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9а-яёәіңғүұқөһ\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
    // translit-lite for common RU letters used in slugs
    const map: Record<string, string> = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "e",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
      ә: "a",
      і: "i",
      ң: "n",
      ғ: "g",
      ү: "u",
      ұ: "u",
      қ: "q",
      ө: "o",
      һ: "h",
    };
    const latin = slug
      .split("")
      .map((c) => map[c] ?? c)
      .join("")
      .replace(/[^a-z0-9-]/g, "");
    if (latin) set("slug", latin);
  }

  const field = (
    label: string,
    key: keyof ProductInput,
    opts?: { type?: string; textarea?: boolean },
  ) => (
    <label className="block text-xs">
      {label}
      {opts?.textarea ? (
        <textarea
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          rows={3}
          value={String(form[key] ?? "")}
          onChange={(e) => set(key, e.target.value as never)}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          value={String(form[key] ?? "")}
          onChange={(e) =>
            set(
              key,
              (opts?.type === "number"
                ? Number(e.target.value)
                : e.target.value) as never,
            )
          }
        />
      )}
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 border border-line bg-paper p-4 sm:p-6 md:grid-cols-2"
    >
      <label className="block text-xs">
        Slug (URL) *
        <div className="mt-1 flex gap-2">
          <input
            className="w-full border border-line px-3 py-2 text-sm"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            required
          />
          {!product?.id ? (
            <button
              type="button"
              className="shrink-0 border border-line px-3 text-xs"
              onClick={autoSlug}
            >
              Auto
            </button>
          ) : null}
        </div>
      </label>
      {field("Бренд / линия", "brand")}
      {field("Название RU", "nameRu")}
      {field("Название KK", "nameKk")}
      {field("Описание RU", "descriptionRu", { textarea: true })}
      {field("Описание KK", "descriptionKk", { textarea: true })}
      {field("Материал RU", "materialRu")}
      {field("Материал KK", "materialKk")}
      <label className="block text-xs">
        Категория
        <select
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="cabin">Ручная кладь</option>
          <option value="checkin">Багаж</option>
          <option value="set">Комплект</option>
          <option value="bag">Сумка</option>
        </select>
      </label>
      {field("Цена ₸", "basePriceKzt", { type: "number" })}
      {field("Высота см", "heightCm", { type: "number" })}
      {field("Ширина см", "widthCm", { type: "number" })}
      {field("Глубина см", "depthCm", { type: "number" })}
      {field("Объём л", "volumeL", { type: "number" })}
      {field("Вес кг", "weightKg", { type: "number" })}
      {field("Колёса", "wheels")}
      {field("Замок", "lockType")}
      <label className="block text-xs">
        Статус
        <select
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="draft">Черновик</option>
          <option value="active">Активен (нужны фото)</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        На главной
      </label>
      {error ? (
        <p className="text-xs text-red-600 md:col-span-2">{error}</p>
      ) : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 w-full bg-ink px-6 text-sm text-paper disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
