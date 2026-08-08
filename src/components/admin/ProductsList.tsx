"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatKzt } from "@/lib/money";
import { ArrowRightIcon } from "@/components/ui/icons";

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
      <div className="grid gap-2 border border-line bg-paper p-3 sm:grid-cols-3">
        <input
          className="border border-line px-3 py-2 text-sm sm:col-span-1"
          placeholder="Поиск: имя, бренд, slug…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border border-line px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="draft">Черновики</option>
        </select>
        <select
          className="border border-line px-3 py-2 text-sm"
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

      <p className="text-xs text-muted">
        Показано {filtered.length} из {products.length}
      </p>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((p) => (
          <div key={p.id} className="border border-line bg-paper p-3">
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
                  <span className="text-[10px] text-muted">нет</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.nameRu}</div>
                <div className="text-xs text-muted">
                  {p.brand} · {p.slug}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="uppercase">{p.status}</span>
                  <span>{formatKzt(p.basePriceKzt)}</span>
                  <span className="text-muted">
                    {p.imageCount} фото · {p.variantCount} вар.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <Link href={`/admin/products/${p.id}`} className="underline">
                Открыть / Edit
              </Link>
              <button
                type="button"
                disabled={busyId === p.id}
                className="underline disabled:opacity-50"
                onClick={() => toggleStatus(p)}
              >
                <span className="inline-flex items-center gap-1">
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                  {p.status === "active" ? "draft" : "active"}
                </span>
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="underline disabled:opacity-50"
                onClick={() => toggleFeatured(p)}
              >
                {p.featured ? "★ featured" : "☆ feature"}
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                className="text-red-600 underline disabled:opacity-50"
                onClick={() => remove(p)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-line bg-paper md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted">
            <tr>
              <th className="p-3">Фото</th>
              <th className="p-3">Товар</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Медиа</th>
              <th className="p-3">CRUD</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="p-3">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-10 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="text-xs text-muted">{p.brand}</div>
                  <div>{p.nameRu}</div>
                  <div className="text-[11px] text-muted">{p.slug}</div>
                </td>
                <td className="p-3">
                  <div className="text-xs uppercase">{p.status}</div>
                  {p.featured ? (
                    <div className="text-[10px] text-muted">featured</div>
                  ) : null}
                </td>
                <td className="p-3">{formatKzt(p.basePriceKzt)}</td>
                <td className="p-3 text-xs text-muted">
                  {p.imageCount} фото
                  <br />
                  {p.variantCount} вар.
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-start gap-1 text-xs">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="underline"
                    >
                      Read/Update
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="underline disabled:opacity-50"
                      onClick={() => toggleStatus(p)}
                    >
                      Toggle status
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="underline disabled:opacity-50"
                      onClick={() => toggleFeatured(p)}
                    >
                      Toggle featured
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className="text-red-600 underline disabled:opacity-50"
                      onClick={() => remove(p)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-line bg-paper p-8 text-center text-sm text-muted">
          Ничего не найдено
        </p>
      ) : null}
    </div>
  );
}
