"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  loadFavorites,
  removeFavorite,
  type FavoriteItem,
} from "@/store/favorites";

export function FavoritesView() {
  const t = useTranslations("favorites");
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(loadFavorites());
    sync();
    window.addEventListener("danial-favorites-updated", sync);
    return () => window.removeEventListener("danial-favorites-updated", sync);
  }, []);

  if (items.length === 0) {
    return (
      <div className="border border-line bg-paper py-16 text-center">
        <p className="text-sm text-muted">{t("empty")}</p>
        <Link
          href="/catalog"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line bg-paper">
      {items.map((item) => (
        <li key={item.productId} className="flex gap-4 p-4">
          <Link
            href={`/catalog/${item.slug}`}
            className="relative h-24 w-20 shrink-0 bg-stone"
          >
            <Image
              src={item.coverUrl}
              alt={item.name}
              fill
              className="object-contain p-1"
              sizes="80px"
              quality={90}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-wide text-muted uppercase">
              {item.brand}
            </p>
            <Link
              href={`/catalog/${item.slug}`}
              className="mt-0.5 block text-sm font-light hover:underline"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted">{item.priceLabel}</p>
            <button
              type="button"
              className="mt-2 text-xs text-muted underline"
              onClick={() => removeFavorite(item.productId)}
            >
              {t("remove")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
