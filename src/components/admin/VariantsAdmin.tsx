"use client";

import { useState } from "react";
import { defaultColorHex } from "@/lib/color-hex";
import {
  buildSku,
  COLOR_PRESETS,
  SIZE_PRESETS,
  colorPreset,
  sizePreset,
} from "@/lib/catalog-presets";

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

  /** Fills colour key, both labels, the swatch and the SKU from one choice. */
  function applyColor(key: string) {
    const preset = colorPreset(key);
    setForm((f) => ({
      ...f,
      colorKey: key,
      colorLabelRu: preset?.ru ?? f.colorLabelRu,
      colorLabelKk: preset?.kk ?? f.colorLabelKk,
      colorHex: preset?.hex ?? f.colorHex,
      sku: key && f.sizeKey ? buildSku(productSlug, key, f.sizeKey) : f.sku,
    }));
  }

  function applySize(key: string) {
    const preset = sizePreset(key);
    setForm((f) => ({
      ...f,
      sizeKey: key,
      sizeLabelRu: preset?.ru ?? f.sizeLabelRu,
      sizeLabelKk: preset?.kk ?? f.sizeLabelKk,
      sku: f.colorKey && key ? buildSku(productSlug, f.colorKey, key) : f.sku,
    }));
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
    <div className="card space-y-5 p-5 sm:p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">Варианты, цвет × размер</h3>
          <p className="text-[0.8125rem] text-muted">
            Каждое сочетание — своя цена и свой остаток на складе.
          </p>
        </div>
        <span className="text-[0.8125rem] text-muted">{variants.length} шт.</span>
      </div>

      {error ? (
        <p className="alert-error">
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
                  <div className="t-data text-muted break-all">
                    SKU: {v.sku} · {v.colorKey}/{v.sizeKey}
                    {v.priceKzt != null
                      ? ` · ${v.priceKzt.toLocaleString("ru-KZ")} ₸`
                      : " · цена базовая"}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-[0.8125rem]">
                  Сток
                  <input
                    type="number"
                    min={0}
                    className="field tabular w-16 px-2 py-1.5"
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
                  className="link-quiet text-[0.8125rem]"
                  onClick={() => startEdit(v)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  className="text-danger text-[0.8125rem] underline-offset-4 hover:underline"
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
        <div className="sm:col-span-2 text-[0.8125rem] tracking-wide text-muted uppercase">
          {editingId ? "Редактирование варианта" : "Новый вариант"}
        </div>

        {/*
          Picking a colour and a size fills the eight fields below. They stay
          visible because a one-off colourway still needs to be typed in, but
          nobody should have to invent an SKU to add a silver cabin case.
        */}
        <label className="block">
          Цвет из палитры
          <select
            className="field"
            value={form.colorKey}
            onChange={(e) => applyColor(e.target.value)}
          >
            <option value="">Выберите цвет</option>
            {COLOR_PRESETS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.ru}
              </option>
            ))}
            {form.colorKey && !colorPreset(form.colorKey) ? (
              <option value={form.colorKey}>{form.colorKey}, свой</option>
            ) : null}
          </select>
        </label>

        <label className="block">
          Размер
          <select
            className="field"
            value={form.sizeKey}
            onChange={(e) => applySize(e.target.value)}
          >
            {SIZE_PRESETS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.ru}
              </option>
            ))}
            {form.sizeKey && !sizePreset(form.sizeKey) ? (
              <option value={form.sizeKey}>{form.sizeKey}, свой</option>
            ) : null}
          </select>
        </label>

        <label className="block text-[0.8125rem] sm:col-span-2">
          SKU *
          <input
            required
            className="field"
            value={form.sku}
            onChange={(e) => setField("sku", e.target.value)}
            placeholder={`${productSlug}-black-55`}
          />
        </label>

        <label className="block">
          colorKey (en) *
          <input
            required
            className="field"
            value={form.colorKey}
            onChange={(e) => {
              const k = e.target.value;
              setField("colorKey", k);
              setField("colorHex", defaultColorHex(k));
            }}
            placeholder="black"
          />
        </label>
        <label className="block">
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
              className="field"
              value={form.colorHex}
              onChange={(e) => setField("colorHex", e.target.value)}
              placeholder="#111111"
            />
          </div>
        </label>
        <label className="block">
          Цвет RU *
          <input
            required
            className="field"
            value={form.colorLabelRu}
            onChange={(e) => {
              setField("colorLabelRu", e.target.value);
              if (!form.colorLabelKk) setField("colorLabelKk", e.target.value);
            }}
            placeholder="Чёрный"
          />
        </label>
        <label className="block">
          Цвет KK
          <input
            className="field"
            value={form.colorLabelKk}
            onChange={(e) => setField("colorLabelKk", e.target.value)}
            placeholder="Қара"
          />
        </label>

        <label className="block">
          sizeKey *
          <input
            required
            list="size-keys"
            className="field"
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
        <label className="block">
          Размер RU
          <input
            className="field"
            value={form.sizeLabelRu}
            onChange={(e) => setField("sizeLabelRu", e.target.value)}
          />
        </label>
        <label className="block">
          Размер KK
          <input
            className="field"
            value={form.sizeLabelKk}
            onChange={(e) => setField("sizeLabelKk", e.target.value)}
          />
        </label>
        <label className="block">
          Цена варианта ₸ (пусто = базовая)
          <input
            type="number"
            min={0}
            className="field"
            value={form.priceKzt}
            onChange={(e) => setField("priceKzt", e.target.value)}
            placeholder="опционально"
          />
        </label>
        <label className="block">
          Остаток
          <input
            type="number"
            min={0}
            className="field"
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
