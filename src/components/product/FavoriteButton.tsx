"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isFavorite,
  toggleFavorite,
  type FavoriteItem,
} from "@/store/favorites";

type Props = {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
};

export function FavoriteButton({ item, className = "" }: Props) {
  const t = useTranslations("favorites");
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isFavorite(item.productId));
    sync();
    window.addEventListener("danial-favorites-updated", sync);
    return () => window.removeEventListener("danial-favorites-updated", sync);
  }, [item.productId]);

  return (
    <button
      type="button"
      aria-label={on ? t("remove") : t("add")}
      aria-pressed={on}
      className={`inline-flex h-9 w-9 items-center justify-center border border-line bg-paper text-sm transition hover:border-ink ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({
          ...item,
          addedAt: new Date().toISOString(),
        });
      }}
    >
      <span className={on ? "text-ink" : "text-muted"}>{on ? "♥" : "♡"}</span>
    </button>
  );
}
