"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckIcon, CloseIcon, SlidersIcon } from "@/components/ui/icons";

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

  // The drawer owns the screen while it is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
    { min: "200000", max: "", label: t("priceFrom", { n: "200 000" }) },
  ];

  const panel = (
    <div className="space-y-7">
      <FilterGroup title={t("type")}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip
              key={c.key || "all"}
              active={active.category === c.key}
              onClick={() => go({ category: c.key || null })}
              label={c.label}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("size")}>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={!active.size}
            onClick={() => go({ size: null })}
            label={t("all")}
          />
          {sizes.map((s) => (
            <Chip
              key={s.key}
              active={active.size === s.key}
              onClick={() => go({ size: active.size === s.key ? null : s.key })}
              label={s.label}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("color")}>
        <div className="flex flex-wrap gap-x-3 gap-y-4">
          {colors.map((c) => {
            const on = active.color === c.key;
            return (
              <button
                key={c.key}
                type="button"
                title={c.label}
                aria-pressed={on}
                onClick={() => go({ color: on ? null : c.key })}
                className="group flex w-14 flex-col items-center gap-1.5"
              >
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                    on
                      ? "ring-2 ring-ink ring-offset-2 ring-offset-sand"
                      : "ring-1 ring-line group-hover:ring-line-strong"
                  }`}
                >
                  <span
                    className="h-full w-full rounded-full ring-1 ring-black/10 ring-inset"
                    style={{ backgroundColor: c.hex || "#ccc" }}
                  />
                  {on ? (
                    <CheckIcon className="absolute h-4 w-4 text-paper mix-blend-difference" />
                  ) : null}
                </span>
                <span
                  className={`w-full text-center text-[0.6875rem] leading-tight ${
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

      <FilterGroup title={t("brand")}>
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

      <FilterGroup title={t("price")}>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={!active.minPrice && !active.maxPrice}
            onClick={() => go({ minPrice: null, maxPrice: null })}
            label={t("all")}
          />
          {pricePresets.map((p) => {
            const on = active.minPrice === p.min && active.maxPrice === p.max;
            return (
              <Chip
                key={p.label}
                active={on}
                label={p.label}
                onClick={() =>
                  go({
                    minPrice: on ? null : p.min || null,
                    maxPrice: on ? null : p.max || null,
                  })
                }
              />
            );
          })}
        </div>
        <p className="mt-3 text-[0.75rem] text-muted">
          {t("priceRangeHint", {
            min: priceMin.toLocaleString("ru-RU"),
            max: priceMax.toLocaleString("ru-RU"),
          })}
        </p>
      </FilterGroup>

      <label className="flex cursor-pointer items-center gap-3 border-t border-line pt-5 text-sm">
        <input
          type="checkbox"
          checked={active.inStock}
          onChange={(e) => go({ inStock: e.target.checked ? "1" : null })}
          className="h-4 w-4 rounded-[3px] accent-[var(--ink)]"
        />
        <span>{t("inStockOnly")}</span>
      </label>
    </div>
  );

  return (
    <>
      {/* Mobile: filters + sort */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-outline h-11 flex-1 px-4 text-sm"
        >
          <SlidersIcon className="h-[18px] w-[18px]" />
          {t("filters")}
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[0.6875rem] text-paper">
              {activeCount}
            </span>
          ) : null}
        </button>
        <SortSelect
          value={active.sort}
          onChange={(v) => go({ sort: v === "new" ? null : v })}
          className="h-11 flex-1"
        />
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />
          <div className="slide-in-left absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col bg-sand">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="t-display text-lg">{t("filters")}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="btn btn-ghost h-9 w-9 p-0"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
            <div className="flex gap-2 border-t border-line bg-paper p-4">
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn btn-outline h-12 px-5 text-sm"
                >
                  {t("reset")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-primary h-12 flex-1 text-sm"
              >
                {t("showResults", { n: resultCount })}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-32">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="t-label text-muted">{t("filters")}</h2>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="link-quiet text-[0.8125rem]"
              >
                {t("reset")}
              </button>
            ) : null}
          </div>
          {panel}
        </div>
      </aside>
    </>
  );
}

export function CatalogSortBar({ resultCount }: { resultCount: number }) {
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
      <p className="t-data text-muted">{t("found", { n: resultCount })}</p>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">{t("sort")}</span>
        <SortSelect value={sort} onChange={setSort} className="h-10" />
      </label>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const t = useTranslations("catalog");
  return (
    <select
      aria-label={t("sort")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`field cursor-pointer appearance-none rounded-full bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235e5e5e' stroke-width='1.5' stroke-linecap='round'%3E%3Cpath d='m6.5 9.5 5.5 5.5 5.5-5.5'/%3E%3C/svg%3E")] bg-[length:18px_18px] bg-[position:right_0.75rem_center] bg-no-repeat py-0 pr-10 pl-4 text-sm ${className}`}
    >
      <option value="new">{t("sortNew")}</option>
      <option value="price_asc">{t("sortPriceAsc")}</option>
      <option value="price_desc">{t("sortPriceDesc")}</option>
    </select>
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
      <p className="t-label mb-3 text-ink">{title}</p>
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
      data-active={active}
      aria-pressed={active}
      className="chip"
    >
      {label}
    </button>
  );
}
