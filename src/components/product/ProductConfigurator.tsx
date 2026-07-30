"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "@/components/product/ProductGallery";
import { addItem } from "@/store/cart";
import type { CartItem } from "@/lib/cart-types";
import { buildSingleItemMessage, buildWaUrl } from "@/lib/whatsapp";
import { formatKzt } from "@/lib/money";

export type ConfigImage = {
  id: string;
  url: string;
  colorKey?: string | null;
  isCover?: boolean;
  sortOrder?: number;
};

export type ConfigVariant = {
  id: string;
  colorKey: string;
  colorLabelRu: string;
  colorLabelKk: string;
  colorHex?: string | null;
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
  variants: ConfigVariant[];
  images: ConfigImage[];
  siteUrl: string;
  waE164: string;
};

export function ProductConfigurator({
  product,
  variants,
  images,
  siteUrl,
  waE164,
}: Props) {
  const t = useTranslations();
  const locale = useLocale() as "ru" | "kk";

  const colors = useMemo(() => {
    const map = new Map<
      string,
      { colorKey: string; labelRu: string; labelKk: string; hex?: string | null }
    >();
    for (const v of variants) {
      if (!map.has(v.colorKey)) {
        map.set(v.colorKey, {
          colorKey: v.colorKey,
          labelRu: v.colorLabelRu,
          labelKk: v.colorLabelKk,
          hex: v.colorHex,
        });
      }
    }
    return [...map.values()];
  }, [variants]);

  const [colorKey, setColorKey] = useState(colors[0]?.colorKey ?? "");
  const sizesForColor = useMemo(
    () => variants.filter((v) => v.colorKey === colorKey),
    [variants, colorKey],
  );
  const [sizeKey, setSizeKey] = useState(sizesForColor[0]?.sizeKey ?? "");

  // keep size valid when color changes
  useEffect(() => {
    const still = sizesForColor.find((s) => s.sizeKey === sizeKey);
    if (!still) setSizeKey(sizesForColor[0]?.sizeKey ?? "");
  }, [colorKey, sizesForColor, sizeKey]);

  const selected =
    variants.find((v) => v.colorKey === colorKey && v.sizeKey === sizeKey) ??
    sizesForColor[0] ??
    variants[0];

  const galleryImages = useMemo(() => {
    const byColor = images
      .filter((i) => i.colorKey === colorKey)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (byColor.length) {
      return byColor.map((i) => ({ id: i.id, url: i.url }));
    }
    // fallback: all images or cover
    const all = [...images].sort(
      (a, b) => Number(b.isCover) - Number(a.isCover),
    );
    return all.map((i) => ({ id: i.id, url: i.url }));
  }, [images, colorKey]);

  const activeCover = galleryImages[0]?.url ?? images[0]?.url ?? "";

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
      imageUrl: activeCover,
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
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductGallery
        key={colorKey}
        images={galleryImages}
        alt={`${name} — ${colorLabel ?? ""}`}
      />

      <div className="space-y-7">
        {/* Color swatches */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
              {t("catalog.color")}
            </p>
            <p className="text-sm font-light">
              {locale === "kk"
                ? colors.find((c) => c.colorKey === colorKey)?.labelKk
                : colors.find((c) => c.colorKey === colorKey)?.labelRu}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((c) => {
              const active = colorKey === c.colorKey;
              return (
                <button
                  key={c.colorKey}
                  type="button"
                  title={locale === "kk" ? c.labelKk : c.labelRu}
                  onClick={() => setColorKey(c.colorKey)}
                  className={`group relative h-10 w-10 rounded-full border-2 transition ${
                    active
                      ? "border-[#0a0a0a] scale-110"
                      : "border-transparent hover:border-black/20"
                  }`}
                  aria-label={locale === "kk" ? c.labelKk : c.labelRu}
                >
                  <span
                    className="absolute inset-1 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: c.hex || "#ccc" }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Size pills — cabin / m / check-in like Samsonite/Delsey */}
        <div>
          <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
            {t("catalog.size")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizesForColor.map((s) => {
              const active = sizeKey === s.sizeKey;
              const label =
                locale === "kk" ? s.sizeLabelKk : s.sizeLabelRu;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeKey(s.sizeKey)}
                  disabled={s.stock <= 0}
                  className={`min-w-[7.5rem] border px-4 py-3 text-left transition ${
                    active
                      ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                      : "border-line hover:border-[#0a0a0a]"
                  } ${s.stock <= 0 ? "opacity-40" : ""}`}
                >
                  <span className="block text-[11px] tracking-wide">
                    {label}
                  </span>
                  <span
                    className={`mt-1 block text-[10px] ${
                      active ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {formatKzt(s.priceKzt ?? product.basePriceKzt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <p className="text-2xl font-light tracking-tight">
            {formatKzt(price)}
          </p>
          {selected ? (
            <p className="mt-1 text-xs text-muted">
              SKU {selected.id.toUpperCase()} ·{" "}
              {selected.stock > 0
                ? locale === "kk"
                  ? "Қолда бар"
                  : "В наличии"
                : t("product.outOfStock")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className="sm:min-w-[10rem]"
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
      </div>
    </div>
  );
}
