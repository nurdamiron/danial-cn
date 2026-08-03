"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/icons";
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
      <div className="card px-6 py-16 text-center">
        <p className="t-display t-h3">{t("empty")}</p>
        <Link
          href="/catalog"
          className={buttonClass("primary", "md", "mt-6 inline-flex")}
        >
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.productId} className="card flex gap-4 p-4">
          <Link
            href={`/catalog/${item.slug}`}
            className="media relative h-28 w-24 shrink-0"
          >
            <Image
              src={item.coverUrl}
              alt={item.name}
              fill
              className="object-contain p-2"
              sizes="96px"
              quality={95}
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="t-label text-muted">{item.brand}</p>
            <Link
              href={`/catalog/${item.slug}`}
              className="t-display mt-0.5 truncate text-base hover:opacity-60"
            >
              {item.name}
            </Link>
            <p className="t-price mt-1 text-sm">{item.priceLabel}</p>
            <button
              type="button"
              className="link-quiet mt-auto flex items-center gap-1.5 pt-3 text-[0.8125rem]"
              onClick={() => removeFavorite(item.productId)}
            >
              <TrashIcon className="h-4 w-4" />
              {t("remove")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
