"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatKzt } from "@/lib/money";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { EmptyState, Notice } from "@/components/admin/ui/AdminSection";

/**
 * The two states a product can be in, in the words the shop uses.
 *
 * "draft" and "active" are the database's words. The person running this shop
 * thinks in terms of whether a bag is on the site or not, and the panel used
 * to make them translate.
 */
const STATUS_LABEL: Record<string, string> = {
  active: "на сайте",
  draft: "черновик",
};

export type ProductRow = {
  id: string;
  brand: string;
  nameRu: string;
  slug: string;
  category: string;
  status: string;
  basePriceKzt: number;
  featured: boolean;
  imageUrl?: string | null;
  sortOrder: number;
  imageCount: number;
  variantCount: number;
};

export function ProductsList({ products: initial }: { products: ProductRow[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!query) return true;
      return (
        p.nameRu.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
      );
    });
  }, [products, q, status, category]);

  async function toggleStatus(p: ProductRow) {
    const next = p.status === "active" ? "draft" : "active";
    setBusyId(p.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Нельзя опубликовать (нужны фото)",
        );
        return;
      }
      setProducts((list) =>
        list.map((x) => (x.id === p.id ? { ...x, status: next } : x)),
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeatured(p: ProductRow) {
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !p.featured }),
      });
      if (!res.ok) return;
      setProducts((list) =>
        list.map((x) =>
          x.id === p.id ? { ...x, featured: !p.featured } : x,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  /**
   * Moves a product in the catalogue order.
   *
   * Swapping the two sortOrder values keeps the rest of the list untouched, so
   * two people reordering different parts of the catalogue do not fight.
   */
  async function move(p: ProductRow, direction: -1 | 1) {
    const ordered = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((x) => x.id === p.id);
    const other = ordered[index + direction];
    if (!other) return;

    setBusyId(p.id);
    try {
      const [a, b] = [
        { id: p.id, sortOrder: other.sortOrder },
        { id: other.id, sortOrder: p.sortOrder },
      ];
      for (const row of [a, b]) {
        const res = await fetch(`/api/admin/products/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: row.sortOrder }),
        });
        if (!res.ok) return;
      }
      setProducts((list) =>
        list.map((x) =>
          x.id === a.id
            ? { ...x, sortOrder: a.sortOrder }
            : x.id === b.id
              ? { ...x, sortOrder: b.sortOrder }
              : x,
        ),
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: ProductRow) {
    if (!confirm(`Удалить товар «${p.nameRu}» безвозвратно?`)) return;
    setBusyId(p.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Ошибка удаления");
        return;
      }
      setProducts((list) => list.filter((x) => x.id !== p.id));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          className="field sm:col-span-1"
          placeholder="Поиск: имя, бренд, slug…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="field"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="draft">Черновики</option>
        </select>
        <select
          className="field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Все категории</option>
          <option value="cabin">Ручная кладь</option>
          <option value="checkin">Багаж</option>
          <option value="set">Комплект</option>
          <option value="bag">Сумка</option>
        </select>
      </div>

      <p className="t-data text-muted">
        Показано {filtered.length} из {products.length}
      </p>

      <Notice>{error}</Notice>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="flex gap-3">
              <div className="flex h-16 w-14 shrink-0 items-center justify-center bg-stone">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="t-data text-muted">нет</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.nameRu}</div>
                <div className="t-data text-muted">
                  {p.brand} · {p.slug}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="tag">{STATUS_LABEL[p.status] ?? p.status}</span>
                  {p.featured ? <span className="tag">на главной</span> : null}
                  <span className="t-price tabular text-sm">
                    {formatKzt(p.basePriceKzt)}
                  </span>
                  <span className="t-data text-muted">
                    {p.imageCount} фото · {p.variantCount} вар.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[0.8125rem]">
              <Link
                href={`/admin/products/${p.id}`}
                className="link-quiet inline-flex items-center gap-1"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                Открыть
              </Link>
              <button
                type="button"
                disabled={busyId === p.id}
                className="link-quiet inline-flex items-center gap-1 disabled:opacity-50"
                onClick={() => toggleStatus(p)}
              >
                {p.status === "active" ? (
                  <EyeOffIcon className="h-3.5 w-3.5" />
                ) : (
                  <EyeIcon className="h-3.5 w-3.5" />
                )}
                {p.status === "active" ? "Снять с сайта" : "Опубликовать"}
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="link-quiet inline-flex items-center gap-1 disabled:opacity-50"
                onClick={() => toggleFeatured(p)}
              >
                <StarIcon className="h-3.5 w-3.5" filled={p.featured} />
                {p.featured ? "Убрать с главной" : "На главную"}
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="link-quiet inline-flex items-center gap-1 disabled:opacity-30"
                onClick={() => move(p, -1)}
                aria-label="Выше в каталоге"
              >
                <ArrowUpIcon className="h-3.5 w-3.5" />
                Выше
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="link-quiet inline-flex items-center gap-1 disabled:opacity-30"
                onClick={() => move(p, 1)}
                aria-label="Ниже в каталоге"
              >
                <ArrowDownIcon className="h-3.5 w-3.5" />
                Ниже
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="inline-flex items-center gap-1 text-danger underline-offset-4 hover:underline disabled:opacity-50"
                onClick={() => remove(p)}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong">
              {["Фото", "Товар", "Статус", "Цена", "Медиа", "Действия"].map(
                (h) => (
                  <th key={h} className="t-label p-3 font-medium text-muted">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-10 object-contain"
                    />
                  ) : (
                    <span className="t-data text-muted">—</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="t-label text-muted">{p.brand}</div>
                  <div className="text-sm">{p.nameRu}</div>
                  <div className="t-data text-muted">{p.slug}</div>
                </td>
                <td className="p-3">
                  <span className="tag">
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.featured ? (
                    <span className="tag mt-1">на главной</span>
                  ) : null}
                </td>
                <td className="t-price tabular p-3 whitespace-nowrap">
                  {formatKzt(p.basePriceKzt)}
                </td>
                <td className="t-data p-3 text-muted">
                  {p.imageCount} фото
                  <br />
                  {p.variantCount} вар.
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-start gap-1 text-[0.8125rem]">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="link-quiet inline-flex items-center gap-1.5"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Открыть
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="link-quiet inline-flex items-center gap-1.5 disabled:opacity-50"
                      onClick={() => toggleStatus(p)}
                    >
                      {p.status === "active" ? (
                        <EyeOffIcon className="h-3.5 w-3.5" />
                      ) : (
                        <EyeIcon className="h-3.5 w-3.5" />
                      )}
                      {p.status === "active" ? "Снять с сайта" : "Опубликовать"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="link-quiet inline-flex items-center gap-1.5 disabled:opacity-50"
                      onClick={() => toggleFeatured(p)}
                    >
                      <StarIcon className="h-3.5 w-3.5" filled={p.featured} />
                      {p.featured ? "Убрать с главной" : "На главную"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1.5 text-danger underline-offset-4 hover:underline disabled:opacity-50"
                      onClick={() => remove(p)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Под фильтр ничего не подходит.</EmptyState>
      ) : null}
    </div>
  );
}
