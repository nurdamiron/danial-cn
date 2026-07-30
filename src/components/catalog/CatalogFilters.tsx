"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export type FilterOption = { key: string; label: string; hex?: string };

type Props = {
  brands: FilterOption[];
  colors: FilterOption[];
  sizes: FilterOption[];
  priceMin: number;
  priceMax: number;
  resultCount: number;
};

function buildQuery(
  current: URLSearchParams,
  patch: Record<string, string | null>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  }
  const s = next.toString();
  return s ? `?${s}` : "";
}

export function CatalogFilters({
  brands,
  colors,
  sizes,
  priceMin,
  priceMax,
  resultCount,
}: Props) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const active = useMemo(
    () => ({
      category: searchParams.get("category") ?? "",
      brand: searchParams.get("brand") ?? "",
      color: searchParams.get("color") ?? "",
      size: searchParams.get("size") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      sort: searchParams.get("sort") ?? "new",
      inStock: searchParams.get("inStock") === "1",
    }),
    [searchParams],
  );

  const activeCount = [
    active.category,
    active.brand,
    active.color,
    active.size,
    active.minPrice,
    active.maxPrice,
    active.inStock ? "1" : "",
  ].filter(Boolean).length;

  function go(patch: Record<string, string | null>) {
    const q = buildQuery(new URLSearchParams(searchParams.toString()), patch);
    router.push(`${pathname}${q}` as "/catalog");
    setOpen(false);
  }

  function clearAll() {
    router.push(pathname);
    setOpen(false);
  }

  const categories = [
    { key: "", label: t("all") },
    { key: "cabin", label: t("catCabin") },
    { key: "checkin", label: t("catCheckin") },
    { key: "set", label: t("catSet") },
    { key: "bag", label: t("catBag") },
  ];

  const pricePresets = [
    { min: "", max: "", label: t("all") },
    {
      min: String(priceMin),
      max: "100000",
      label: t("priceUpTo", { n: "100 000" }),
    },
    {
      min: "100000",
      max: "150000",
      label: t("priceBetween", { a: "100 000", b: "150 000" }),
    },
    {
      min: "150000",
      max: "200000",
      label: t("priceBetween", { a: "150 000", b: "200 000" }),
    },
    {
      min: "200000",
      max: "",
      label: t("priceFrom", { n: "200 000" }),
    },
  ];

  const panel = (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{t("filters")}</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted underline-offset-2 hover:underline"
          >
            {t("reset")}
          </button>
        ) : null}
      </div>

      {/* Category */}
      <FilterGroup title={t("type")}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip
              key={c.key || "all"}
              active={active.category === c.key}
              onClick={() =>
                go({ category: c.key || null })
              }
              label={c.label}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Material / brand */}
      <FilterGroup title={t("material")}>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={!active.brand}
            onClick={() => go({ brand: null })}
            label={t("all")}
          />
          {brands.map((b) => (
            <Chip
              key={b.key}
              active={active.brand === b.key}
              onClick={() =>
                go({ brand: active.brand === b.key ? null : b.key })
              }
              label={b.label}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Size */}
      <FilterGroup title={t("size")}>
        <div className="flex flex-col gap-2">
          {sizes.map((s) => (
            <label
              key={s.key}
              className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 text-sm transition ${
                active.size === s.key
                  ? "border-ink bg-ink text-paper"
                  : "border-line hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="size"
                className="sr-only"
                checked={active.size === s.key}
                onChange={() =>
                  go({ size: active.size === s.key ? null : s.key })
                }
              />
              <span className="flex-1">{s.label}</span>
              {active.size === s.key ? (
                <button
                  type="button"
                  className="text-xs opacity-70"
                  onClick={(e) => {
                    e.preventDefault();
                    go({ size: null });
                  }}
                >
                  ×
                </button>
              ) : null}
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Color swatches */}
      <FilterGroup title={t("color")}>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => {
            const on = active.color === c.key;
            return (
              <button
                key={c.key}
                type="button"
                title={c.label}
                onClick={() => go({ color: on ? null : c.key })}
                className={`group flex flex-col items-center gap-1.5 ${on ? "" : "opacity-80 hover:opacity-100"}`}
              >
                <span
                  className={`relative h-9 w-9 rounded-full border-2 transition ${
                    on ? "border-ink scale-110" : "border-transparent"
                  }`}
                >
                  <span
                    className="absolute inset-1 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex || "#ccc" }}
                  />
                </span>
                <span
                  className={`max-w-[4.5rem] truncate text-[10px] ${
                    on ? "text-ink" : "text-muted"
                  }`}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title={t("price")}>
        <div className="flex flex-col gap-2">
          {pricePresets.map((p) => {
            const on =
              active.minPrice === p.min && active.maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() =>
                  go({
                    minPrice: on ? null : p.min || null,
                    maxPrice: on ? null : p.max || null,
                  })
                }
                className={`border px-3 py-2.5 text-left text-sm transition ${
                  on
                    ? "border-ink bg-ink text-paper"
                    : "border-line hover:border-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {t("priceRangeHint", {
            min: priceMin.toLocaleString("ru-RU"),
            max: priceMax.toLocaleString("ru-RU"),
          })}
        </p>
      </FilterGroup>

      {/* In stock */}
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={active.inStock}
          onChange={(e) =>
            go({ inStock: e.target.checked ? "1" : null })
          }
          className="h-4 w-4 accent-ink"
        />
        <span>{t("inStockOnly")}</span>
      </label>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 border border-ink bg-paper px-4 py-3 text-sm"
        >
          {t("filters")}
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] text-paper">
              {activeCount}
            </span>
          ) : null}
        </button>
        <select
          className="border border-line bg-paper px-3 py-3 text-sm outline-none"
          value={active.sort}
          onChange={(e) => go({ sort: e.target.value === "new" ? null : e.target.value })}
          aria-label={t("sort")}
        >
          <option value="new">{t("sortNew")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
        </select>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-paper shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="text-sm font-medium">{t("filters")}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted"
              >
                {t("close")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">{panel}</div>
            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full bg-ink py-3 text-sm text-paper"
              >
                {t("showResults", { n: resultCount })}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">{panel}</aside>
    </>
  );
}

export function CatalogSortBar({
  resultCount,
}: {
  resultCount: number;
}) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "new";

  function setSort(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "new") next.delete("sort");
    else next.set("sort", value);
    const q = next.toString();
    router.push(`${pathname}${q ? `?${q}` : ""}` as "/catalog");
  }

  return (
    <div className="mb-8 hidden items-center justify-between gap-4 border-b border-line pb-4 lg:flex">
      <p className="text-sm text-muted">
        {t("found", { n: resultCount })}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">{t("sort")}</span>
        <select
          className="border border-line bg-paper px-3 py-2 outline-none"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">{t("sortNew")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
        </select>
      </label>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-wide text-ink">{title}</p>
      {children}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
