"use client";

import { useMemo, useState } from "react";
import { formatKzt } from "@/lib/money";

export type PricingVariant = {
  id: string;
  colorLabelRu: string;
  colorHex: string;
  sizeLabelRu: string;
  sizeKey: string;
  priceKzt: number | null;
  stock: number;
};

export type PricingProduct = {
  id: string;
  slug: string;
  nameRu: string;
  brand: string;
  status: string;
  basePriceKzt: number;
  variants: PricingVariant[];
};

type Edit = { priceKzt: number | null; stock: number };

export function PricingBoard({ products }: { products: PricingProduct[] }) {
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .map((p) => ({
        ...p,
        variants: p.variants.filter(
          () =>
            !needle ||
            p.nameRu.toLowerCase().includes(needle) ||
            p.brand.toLowerCase().includes(needle),
        ),
      }))
      .filter((p) => p.variants.length > 0);
  }, [products, query]);

  const dirty = Object.keys(edits).length;

  function current(v: PricingVariant): Edit {
    return edits[v.id] ?? { priceKzt: v.priceKzt, stock: v.stock };
  }

  function change(v: PricingVariant, patch: Partial<Edit>) {
    setMessage("");
    setEdits((prev) => {
      const base = prev[v.id] ?? { priceKzt: v.priceKzt, stock: v.stock };
      const next = { ...base, ...patch };
      // Back to the stored values means it is no longer an edit.
      if (next.priceKzt === v.priceKzt && next.stock === v.stock) {
        const rest = { ...prev };
        delete rest[v.id];
        return rest;
      }
      return { ...prev, [v.id]: next };
    });
  }

  async function save() {
    if (!dirty) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: Object.entries(edits).map(([id, e]) => ({ id, ...e })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      setMessage(
        `Сохранено ${data.updated}. На сайте обновится через несколько секунд.`,
      );
      setEdits({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[57px] z-30 -mx-4 border-b border-line bg-sand/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="min-w-0 flex-1 border border-line bg-paper px-3 py-2 text-sm sm:max-w-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по товару или линейке"
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="h-10 bg-ink px-5 text-sm text-paper disabled:opacity-40"
          >
            {saving ? "…" : dirty ? `Сохранить, ${dirty}` : "Изменений нет"}
          </button>
        </div>
        {error ? (
          <p className="mt-2 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-2 border border-line bg-paper px-3 py-2 text-xs">
            {message}
          </p>
        ) : null}
      </div>

      {rows.map((p) => (
        <div key={p.id} className="border border-line bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <span className="text-[11px] tracking-[0.16em] text-muted uppercase">
                {p.brand}
              </span>
              <h2 className="text-sm">{p.nameRu}</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>Базовая {formatKzt(p.basePriceKzt)}</span>
              {p.status !== "active" ? (
                <span className="border border-line px-2 py-0.5">черновик</span>
              ) : null}
            </div>
          </div>

          <div className="divide-y divide-line">
            {p.variants.map((v) => {
              const e = current(v);
              const changed = Boolean(edits[v.id]);
              return (
                <div
                  key={v.id}
                  className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 ${
                    changed ? "bg-stone" : ""
                  }`}
                >
                  {/* On a phone the name gets its own line: squeezed onto one
                      row it wrapped to three and collided with the field. */}
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-full border border-line"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span className="min-w-0 text-xs">
                      {v.colorLabelRu}
                      <span className="text-muted">, {v.sizeLabelRu}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pl-6 sm:justify-end sm:pl-0">
                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-muted">Цена</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      className="w-28 border border-line px-2 py-1.5 text-right text-sm tabular-nums"
                      value={e.priceKzt ?? ""}
                      placeholder={String(p.basePriceKzt)}
                      onChange={(ev) =>
                        change(v, {
                          priceKzt:
                            ev.target.value === ""
                              ? null
                              : Number(ev.target.value),
                        })
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={e.stock > 0}
                      onChange={(ev) =>
                        change(v, { stock: ev.target.checked ? 5 : 0 })
                      }
                    />
                    <span className={e.stock > 0 ? "" : "text-red-600"}>
                      {e.stock > 0 ? "в наличии" : "нет"}
                    </span>
                  </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {rows.length === 0 ? (
        <p className="border border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          Ничего не нашлось.
        </p>
      ) : null}

      <p className="text-xs text-muted">
        Пустая цена означает, что берётся базовая цена товара. Снятая галочка
        убирает вариант из выдачи по фильтру наличия и показывает его как
        распроданный.
      </p>
    </div>
  );
}
