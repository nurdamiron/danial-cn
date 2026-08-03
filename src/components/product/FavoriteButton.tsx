"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/ui/icons";
import {
  isFavorite,
  toggleFavorite,
  type FavoriteItem,
} from "@/store/favorites";

type Props = {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({ item, className = "", size = "sm" }: Props) {
  const t = useTranslations("favorites");
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isFavorite(item.productId));
    sync();
    window.addEventListener("danial-favorites-updated", sync);
    return () => window.removeEventListener("danial-favorites-updated", sync);
  }, [item.productId]);

  const box = size === "md" ? "h-12 w-12" : "h-9 w-9";

  return (
    <button
      type="button"
      aria-label={on ? t("remove") : t("add")}
      aria-pressed={on}
      className={`inline-flex ${box} items-center justify-center rounded-full border border-line bg-paper/90 backdrop-blur transition hover:border-ink ${
        on ? "text-ink" : "text-muted"
      } ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({
          ...item,
          addedAt: new Date().toISOString(),
        });
      }}
    >
      <HeartIcon
        filled={on}
        className={size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]"}
      />
    </button>
  );
}
