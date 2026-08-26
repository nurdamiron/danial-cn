"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductInput = {
  id?: string;
  /** Absent on create — the server derives it from brand and name. */
  slug?: string;
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
  // A saved product keeps every field: its URL is public and its Kazakh copy
  // is worth writing properly. Creating one asks for the short version.
  const isEdit = Boolean(product?.id);
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

  const field = (
    label: string,
    key: keyof ProductInput,
    opts?: { type?: string; textarea?: boolean },
  ) => (
    <label className="block">
      {label}
      {opts?.textarea ? (
        <textarea
          className="field"
          rows={3}
          value={String(form[key] ?? "")}
          onChange={(e) => set(key, e.target.value as never)}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          className="field"
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
      className="card grid gap-5 p-5 sm:p-7 md:grid-cols-2"
    >
      {isEdit ? (
        <label className="block">
          Slug (URL) *
          <input
            className="field"
            value={form.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
            required
          />
        </label>
      ) : null}
      {field("Бренд / линия", "brand")}
      {field(isEdit ? "Название RU" : "Название", "nameRu")}
      {isEdit ? field("Название KK", "nameKk") : null}
      {field(isEdit ? "Описание RU" : "Описание", "descriptionRu", {
        textarea: true,
      })}
      {isEdit ? field("Описание KK", "descriptionKk", { textarea: true }) : null}
      {field(isEdit ? "Материал RU" : "Материал", "materialRu")}
      {isEdit ? field("Материал KK", "materialKk") : null}
      <label className="block">
        Категория
        <select
          className="field"
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
      <label className="block">
        Статус
        <select
          className="field"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="draft">Черновик</option>
          <option value="active">Активен (нужны фото)</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-[0.8125rem]">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        На главной
      </label>
      {!isEdit ? (
        <p className="text-[0.8125rem] text-muted md:col-span-2">
          Адрес товара и казахский текст заполнятся сами — их можно поправить
          после сохранения.
        </p>
      ) : null}
      {error ? (
        <p className="alert-error md:col-span-2">{error}</p>
      ) : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary h-12 w-full px-8 text-sm sm:w-auto"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
