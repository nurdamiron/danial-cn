"use client";

import { useState } from "react";
import { defaultColorHex } from "@/lib/color-hex";

export type VariantRow = {
  id: string;
  sku: string;
  colorKey: string;
  colorLabelRu: string;
  colorLabelKk: string;
  colorHex?: string | null;
  sizeKey: string;
  sizeLabelRu: string;
  sizeLabelKk: string;
  priceKzt: number | null;
  stock: number;
};

const emptyForm = {
  sku: "",
  colorKey: "",
  colorLabelRu: "",
  colorLabelKk: "",
  colorHex: "#888888",
  sizeKey: "55",
  sizeLabelRu: "55 см",
  sizeLabelKk: "55 см",
  priceKzt: "" as string | number,
  stock: 0,
};

export function VariantsAdmin({
  productId,
  productSlug,
  initialVariants,
}: {
  productId: string;
  productSlug: string;
  initialVariants: VariantRow[];
}) {
  const [variants, setVariants] = useState(initialVariants);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(v: VariantRow) {
    setEditingId(v.id);
    setForm({
      sku: v.sku,
      colorKey: v.colorKey,
      colorLabelRu: v.colorLabelRu,
      colorLabelKk: v.colorLabelKk,
      colorHex: v.colorHex || defaultColorHex(v.colorKey),
      sizeKey: v.sizeKey,
      sizeLabelRu: v.sizeLabelRu,
      sizeLabelKk: v.sizeLabelKk,
      priceKzt: v.priceKzt ?? "",
      stock: v.stock,
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm, sku: `${productSlug}-` });
    setError("");
  }

  function payload() {
    const colorKey = form.colorKey.trim();
    return {
      sku: form.sku.trim(),
      colorKey,
      colorLabelRu: form.colorLabelRu.trim(),
      colorLabelKk: form.colorLabelKk.trim() || form.colorLabelRu.trim(),
      colorHex: form.colorHex.trim() || defaultColorHex(colorKey),
      sizeKey: String(form.sizeKey).trim(),
      sizeLabelRu: form.sizeLabelRu.trim(),
      sizeLabelKk: form.sizeLabelKk.trim() || form.sizeLabelRu.trim(),
      priceKzt:
        form.priceKzt === "" || form.priceKzt === null
          ? null
          : Number(form.priceKzt),
      stock: Number(form.stock) || 0,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = payload();
      if (!body.sku || !body.colorKey || !body.colorLabelRu || !body.sizeKey) {
        setError("Заполните SKU, цвет и размер");
        return;
      }

      if (editingId) {
        const res = await fetch(
          `/api/admin/products/${productId}/variants/${editingId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Ошибка обновления");
          return;
        }
        setVariants((list) =>
          list.map((v) => (v.id === editingId ? data.variant : v)),
        );
        cancelEdit();
      } else {
        const res = await fetch(`/api/admin/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Ошибка создания");
          return;
        }
        setVariants((list) => [...list, data.variant]);
        cancelEdit();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить этот вариант (цвет/размер)?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка удаления");
        return;
      }
      setVariants((list) => list.filter((v) => v.id !== id));
      if (editingId === id) cancelEdit();
    } finally {
      setBusy(false);
    }
  }

  async function quickStock(id: string, stock: number) {
    const res = await fetch(
      `/api/admin/products/${productId}/variants/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Math.max(0, stock) }),
      },
    );
    const data = await res.json();
    if (res.ok) {
      setVariants((list) =>
        list.map((v) => (v.id === id ? data.variant : v)),
      );
    } else {
      setError(data.error ?? "Ошибка склада");
    }
  }

  return (
    <div className="space-y-4 border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Варианты (цвет × размер)</h3>
          <p className="text-xs text-muted">
            Полный CRUD: SKU, цвет, hex, размер, цена, остаток.
          </p>
        </div>
        <span className="text-xs text-muted">{variants.length} шт.</span>
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        {variants.map((v) => (
          <div
            key={v.id}
            className={`border p-3 ${
              editingId === v.id ? "border-ink bg-stone/40" : "border-line"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-0.5 aspect-square h-6 w-6 shrink-0 rounded-full border border-line"
                  style={{
                    backgroundColor:
                      v.colorHex || defaultColorHex(v.colorKey),
                  }}
                  title={v.colorHex || ""}
                />
                <div>
                  <div className="text-sm">
                    {v.colorLabelRu} · {v.sizeLabelRu}
                  </div>
                  <div className="text-[11px] text-muted break-all">
                    SKU: {v.sku} · {v.colorKey}/{v.sizeKey}
                    {v.priceKzt != null
                      ? ` · ${v.priceKzt.toLocaleString("ru-KZ")} ₸`
                      : " · цена базовая"}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  Сток
                  <input
                    type="number"
                    min={0}
                    className="w-16 border border-line px-2 py-1 text-sm"
                    value={v.stock}
                    onChange={(e) =>
                      setVariants((list) =>
                        list.map((x) =>
                          x.id === v.id
                            ? { ...x, stock: Number(e.target.value) || 0 }
                            : x,
                        ),
                      )
                    }
                    onBlur={(e) =>
                      quickStock(v.id, Number(e.target.value) || 0)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => startEdit(v)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  className="text-xs text-red-600 underline"
                  disabled={busy}
                  onClick={() => remove(v.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
        {variants.length === 0 ? (
          <p className="text-sm text-muted">Вариантов нет — добавьте первый.</p>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-3 border border-line bg-stone/30 p-3 sm:grid-cols-2 sm:p-4"
      >
        <div className="sm:col-span-2 text-xs tracking-wide text-muted uppercase">
          {editingId ? "Редактирование варианта" : "Новый вариант"}
        </div>

        <label className="block text-xs sm:col-span-2">
          SKU *
          <input
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.sku}
            onChange={(e) => setField("sku", e.target.value)}
            placeholder={`${productSlug}-black-55`}
          />
        </label>

        <label className="block text-xs">
          colorKey (en) *
          <input
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.colorKey}
            onChange={(e) => {
              const k = e.target.value;
              setField("colorKey", k);
              setField("colorHex", defaultColorHex(k));
            }}
            placeholder="black"
          />
        </label>
        <label className="block text-xs">
          Цвет (hex)
          <div className="mt-1 flex gap-2">
            <input
              type="color"
              className="h-10 w-12 border border-line bg-paper p-0.5"
              value={
                form.colorHex?.startsWith("#") ? form.colorHex : "#888888"
              }
              onChange={(e) => setField("colorHex", e.target.value)}
            />
            <input
              className="w-full border border-line bg-paper px-3 py-2 text-sm"
              value={form.colorHex}
              onChange={(e) => setField("colorHex", e.target.value)}
              placeholder="#111111"
            />
          </div>
        </label>
        <label className="block text-xs">
          Цвет RU *
          <input
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.colorLabelRu}
            onChange={(e) => {
              setField("colorLabelRu", e.target.value);
              if (!form.colorLabelKk) setField("colorLabelKk", e.target.value);
            }}
            placeholder="Чёрный"
          />
        </label>
        <label className="block text-xs">
          Цвет KK
          <input
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.colorLabelKk}
            onChange={(e) => setField("colorLabelKk", e.target.value)}
            placeholder="Қара"
          />
        </label>

        <label className="block text-xs">
          sizeKey *
          <input
            required
            list="size-keys"
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.sizeKey}
            onChange={(e) => {
              const k = e.target.value;
              setField("sizeKey", k);
              if (["55", "65", "75"].includes(k)) {
                setField("sizeLabelRu", `${k} см`);
                setField("sizeLabelKk", `${k} см`);
              }
            }}
            placeholder="55"
          />
          <datalist id="size-keys">
            <option value="55" />
            <option value="65" />
            <option value="75" />
          </datalist>
        </label>
        <label className="block text-xs">
          Размер RU
          <input
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.sizeLabelRu}
            onChange={(e) => setField("sizeLabelRu", e.target.value)}
          />
        </label>
        <label className="block text-xs">
          Размер KK
          <input
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.sizeLabelKk}
            onChange={(e) => setField("sizeLabelKk", e.target.value)}
          />
        </label>
        <label className="block text-xs">
          Цена варианта ₸ (пусто = базовая)
          <input
            type="number"
            min={0}
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.priceKzt}
            onChange={(e) => setField("priceKzt", e.target.value)}
            placeholder="опционально"
          />
        </label>
        <label className="block text-xs">
          Остаток
          <input
            type="number"
            min={0}
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
            value={form.stock}
            onChange={(e) => setField("stock", Number(e.target.value) || 0)}
          />
        </label>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button
            type="submit"
            disabled={busy}
            className="h-10 bg-ink px-5 text-sm text-paper disabled:opacity-50"
          >
            {busy
              ? "…"
              : editingId
                ? "Сохранить вариант"
                : "+ Добавить вариант"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="h-10 border border-line px-5 text-sm"
              onClick={cancelEdit}
            >
              Отмена
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
