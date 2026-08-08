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
  brandKey: string;
  wheelsRu?: string;
  wheelsKk?: string;
  lockRu?: string;
  lockKk?: string;
  status: string;
  featured: boolean;
};

const empty: ProductInput = {
  slug: "",
  brand: "",
  brandKey: "",
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
            : "Save failed (need photos to publish)",
        );
        return;
      }
      if (!isEdit) {
        router.push(`/admin/products/${data.product.id}`);
      } else {
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
    <label className="block text-xs">
      {label}
      {opts?.textarea ? (
        <textarea
          className="mt-1 w-full border border-[#e5e5e5] px-3 py-2 text-sm"
          rows={3}
          value={String(form[key] ?? "")}
          onChange={(e) => set(key, e.target.value as never)}
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          className="mt-1 w-full border border-[#e5e5e5] px-3 py-2 text-sm"
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
      className="grid gap-4 border border-[#e5e5e5] bg-white p-6 md:grid-cols-2"
    >
      {field("Slug", "slug")}
      {field("Brand / line", "brand")}
      {field("Brand key (logo file in public/brand)", "brandKey")}
      {field("Name RU", "nameRu")}
      {field("Name KK", "nameKk")}
      {field("Description RU", "descriptionRu", { textarea: true })}
      {field("Description KK", "descriptionKk", { textarea: true })}
      {field("Material RU", "materialRu")}
      {field("Material KK", "materialKk")}
      <label className="block text-xs">
        Category
        <select
          className="mt-1 w-full border border-[#e5e5e5] px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="cabin">cabin</option>
          <option value="checkin">checkin</option>
          <option value="set">set</option>
          <option value="bag">bag</option>
        </select>
      </label>
      {field("Price ₸", "basePriceKzt", { type: "number" })}
      {field("Height cm", "heightCm", { type: "number" })}
      {field("Width cm", "widthCm", { type: "number" })}
      {field("Depth cm", "depthCm", { type: "number" })}
      {field("Volume L", "volumeL", { type: "number" })}
      {field("Weight kg", "weightKg", { type: "number" })}
      {field("Wheels RU", "wheelsRu")}
      {field("Wheels KK", "wheelsKk")}
      {field("Lock RU", "lockRu")}
      {field("Lock KK", "lockKk")}
      <label className="block text-xs">
        Status
        <select
          className="mt-1 w-full border border-[#e5e5e5] px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="draft">draft</option>
          <option value="active">active (needs photos)</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        Featured
      </label>
      {error ? (
        <p className="text-xs text-red-600 md:col-span-2">{error}</p>
      ) : null}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#111] px-6 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
