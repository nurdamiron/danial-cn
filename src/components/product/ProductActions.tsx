"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { addItem } from "@/store/cart";
import type { CartItem } from "@/lib/cart-types";
import { buildSingleItemMessage, buildWaUrl } from "@/lib/whatsapp";
import { formatKzt } from "@/lib/money";

type Variant = {
  id: string;
  colorKey: string;
  colorLabelRu: string;
  colorLabelKk: string;
  sizeKey: string;
  sizeLabelRu: string;
  sizeLabelKk: string;
  priceKzt: number | null;
  stock: number;
};

type Props = {
  product: {
    id: string;
    slug: string;
    brand: string;
    nameRu: string;
    nameKk: string;
    materialRu: string;
    materialKk: string;
    basePriceKzt: number;
  };
  variants: Variant[];
  coverUrl: string;
  siteUrl: string;
  waE164: string;
};

export function ProductActions({
  product,
  variants,
  coverUrl,
  siteUrl,
  waE164,
}: Props) {
  const t = useTranslations();
  const locale = useLocale() as "ru" | "kk";
  const colors = useMemo(() => {
    const map = new Map<string, Variant>();
    for (const v of variants) {
      if (!map.has(v.colorKey)) map.set(v.colorKey, v);
    }
    return [...map.values()];
  }, [variants]);

  const [colorKey, setColorKey] = useState(colors[0]?.colorKey ?? "");
  const sizesForColor = variants.filter((v) => v.colorKey === colorKey);
  const [sizeKey, setSizeKey] = useState(sizesForColor[0]?.sizeKey ?? "");
  const selected =
    variants.find((v) => v.colorKey === colorKey && v.sizeKey === sizeKey) ??
    sizesForColor[0] ??
    variants[0];

  const name = locale === "kk" ? product.nameKk : product.nameRu;
  const material = locale === "kk" ? product.materialKk : product.materialRu;
  const colorLabel =
    locale === "kk" ? selected?.colorLabelKk : selected?.colorLabelRu;
  const sizeLabel =
    locale === "kk" ? selected?.sizeLabelKk : selected?.sizeLabelRu;
  const price = selected?.priceKzt ?? product.basePriceKzt;

  function toCartItem(qty = 1): CartItem | null {
    if (!selected) return null;
    return {
      productId: product.id,
      variantId: selected.id,
      slug: product.slug,
      brand: product.brand,
      name,
      colorLabel: colorLabel ?? "",
      sizeLabel: sizeLabel ?? "",
      material,
      unitPriceKzt: price,
      qty,
      imageUrl: coverUrl,
      productUrl: `${siteUrl}/${locale}/catalog/${product.slug}`,
    };
  }

  function labels() {
    return {
      title: "DANIAL CN — заказ",
      delivery: {
        cargo: t("delivery.cargo"),
        avia: t("delivery.avia"),
        express: t("delivery.express"),
      },
      replicaLine:
        locale === "kk" ? "Danial CN · премиум багаж" : "Danial CN · премиум-багаж",
      paymentNote: t("payment.kaspiNote"),
      fields: {
        name: t("cart.name"),
        city: t("cart.city"),
        phone: t("cart.phone"),
        delivery: t("cart.deliveryMethod"),
        total: t("cart.subtotal"),
      },
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-muted uppercase">
          {t("catalog.color")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.colorKey}
              type="button"
              onClick={() => {
                setColorKey(c.colorKey);
                const nextSizes = variants.filter(
                  (v) => v.colorKey === c.colorKey,
                );
                setSizeKey(nextSizes[0]?.sizeKey ?? "");
              }}
              className={`border px-3 py-1.5 text-xs ${
                colorKey === c.colorKey
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-line"
              }`}
            >
              {locale === "kk" ? c.colorLabelKk : c.colorLabelRu}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest text-muted uppercase">
          {t("catalog.size")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizesForColor.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSizeKey(s.sizeKey)}
              className={`border px-3 py-1.5 text-xs ${
                sizeKey === s.sizeKey
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-line"
              }`}
            >
              {locale === "kk" ? s.sizeLabelKk : s.sizeLabelRu}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xl">{formatKzt(price)}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => {
            const item = toCartItem(1);
            if (item) addItem(item);
          }}
          disabled={!selected || selected.stock <= 0}
        >
          {t("cta.addToCart")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const item = toCartItem(1);
            if (!item) return;
            const msg = buildSingleItemMessage({
              locale,
              item,
              labels: labels(),
            });
            window.open(buildWaUrl(waE164, msg), "_blank");
          }}
        >
          {t("cta.buyWhatsApp")}
        </Button>
      </div>

      {selected && selected.stock <= 0 ? (
        <p className="text-sm text-muted">{t("product.outOfStock")}</p>
      ) : null}
    </div>
  );
}
