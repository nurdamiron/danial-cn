"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, Notice } from "@/components/admin/ui/AdminSection";
import { ProductCard } from "@/components/admin/ProductCard";

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

      {/*
        One card at every width. The phone and the desktop used to render two
        different components from the same rows, which had already drifted into
        two different sets of actions — reordering existed only on the phone.
      */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            busy={busyId === p.id}
            onToggleStatus={() => toggleStatus(p)}
            onToggleFeatured={() => toggleFeatured(p)}
            onMove={(direction) => move(p, direction)}
            onRemove={() => remove(p)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Под фильтр ничего не подходит.</EmptyState>
      ) : null}
    </div>
  );
}
