"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuickOrderModal } from "@/components/product/QuickOrderModal";
import { addItem } from "@/store/cart";
import type { CartItem, CartMeta } from "@/lib/cart-types";
import { buildSingleItemMessage, buildWaUrl } from "@/lib/whatsapp";
import { openLater, recordOrder } from "@/lib/record-order";
import { saveOrder } from "@/store/orders";
import { formatKzt } from "@/lib/money";
import { FavoriteButton } from "@/components/product/FavoriteButton";

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
  kaspiNote: string;
  deliveryNote: string;
};

export function ProductConfigurator({
  product,
  variants,
  images,
  siteUrl,
  waE164,
  kaspiNote,
  deliveryNote,
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

  const [orderOpen, setOrderOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [colorKey, setColorKey] = useState(colors[0]?.colorKey ?? "");
  const sizesForColor = useMemo(
    () => variants.filter((v) => v.colorKey === colorKey),
    [variants, colorKey],
  );
  const [sizeKey, setSizeKey] = useState(sizesForColor[0]?.sizeKey ?? "");

  // Reset size when it becomes invalid for the newly selected color.
  // Adjusting state during render (React's recommended pattern) instead of
  // an effect avoids an extra render pass on every color change.
  const [sizeKeyForColor, setSizeKeyForColor] = useState(colorKey);
  if (colorKey !== sizeKeyForColor) {
    setSizeKeyForColor(colorKey);
    if (!sizesForColor.some((s) => s.sizeKey === sizeKey)) {
      setSizeKey(sizesForColor[0]?.sizeKey ?? "");
    }
  }

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );

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
      title: locale === "kk" ? "Danial CN — тапсырыс" : "Danial CN — заказ",
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

      <div className="space-y-8">
        {/* Colour */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="t-label text-muted">{t("catalog.color")}</p>
            <p className="text-sm">
              {locale === "kk"
                ? colors.find((c) => c.colorKey === colorKey)?.labelKk
                : colors.find((c) => c.colorKey === colorKey)?.labelRu}
            </p>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const active = colorKey === c.colorKey;
              const label = locale === "kk" ? c.labelKk : c.labelRu;
              return (
                <button
                  key={c.colorKey}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  onClick={() => setColorKey(c.colorKey)}
                  className={`relative flex aspect-square h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                    active
                      ? "ring-2 ring-ink ring-offset-2 ring-offset-paper"
                      : "ring-1 ring-line hover:ring-line-strong"
                  }`}
                >
                  <span
                    className="aspect-square h-full w-full shrink-0 rounded-full ring-1 ring-black/10 ring-inset"
                    style={{ backgroundColor: c.hex || "#ccc" }}
                  />
                  {active ? (
                    <CheckIcon className="absolute h-4 w-4 text-paper mix-blend-difference" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size — the price moves with it, so it is shown on every option */}
        <div>
          <p className="t-label text-muted">{t("catalog.size")}</p>
          <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
            {sizesForColor.map((s) => {
              const active = sizeKey === s.sizeKey;
              const out = s.stock <= 0;
              const label = locale === "kk" ? s.sizeLabelKk : s.sizeLabelRu;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeKey(s.sizeKey)}
                  disabled={out}
                  aria-pressed={active}
                  className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper hover:border-line-strong"
                  } ${out ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <span className="text-sm">{label}</span>
                  <span
                    className={`t-price text-sm ${
                      active ? "text-paper/80" : "text-muted"
                    }`}
                  >
                    {formatKzt(s.priceKzt ?? product.basePriceKzt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price and availability */}
        <div className="border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="t-price text-[2rem] leading-none">
              {formatKzt(price)}
            </p>
            {selected ? (
              <span
                className={`tag ${
                  selected.stock > 0 ? "text-ink" : "text-muted"
                }`}
              >
                {selected.stock > 0
                  ? t("product.inStockLabel")
                  : t("product.outOfStock")}
              </span>
            ) : null}
          </div>
          {selected ? (
            <p className="t-data mt-2 text-muted">
              {t("product.article")} {selected.id.toUpperCase()}
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="lg"
            className="min-w-[11rem] flex-1 sm:flex-none"
            onClick={() => {
              const item = toCartItem(1);
              if (!item) return;
              addItem(item);
              setJustAdded(true);
              if (addedTimer.current) clearTimeout(addedTimer.current);
              addedTimer.current = setTimeout(() => setJustAdded(false), 2200);
            }}
            disabled={!selected || selected.stock <= 0}
          >
            {justAdded ? (
              <>
                <CheckIcon className="h-[18px] w-[18px]" />
                {t("cta.added")}
              </>
            ) : (
              t("cta.addToCart")
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none"
            disabled={!selected || selected.stock <= 0}
            onClick={() => setOrderOpen(true)}
          >
            <WhatsAppIcon />
            {t("cta.buyWhatsApp")}
          </Button>
          <FavoriteButton
            size="md"
            item={{
              productId: product.id,
              slug: product.slug,
              brand: product.brand,
              name,
              priceLabel: formatKzt(product.basePriceKzt),
              coverUrl: activeCover,
            }}
          />
        </div>

        {/* What happens after the order */}
        <ul className="space-y-3 rounded-lg border border-line bg-sand p-5">
          <li className="flex items-start gap-3">
            <KaspiBadge height={18} className="mt-0.5 shrink-0" />
            <span className="t-micro text-muted">{kaspiNote}</span>
          </li>
          <li className="t-micro border-t border-line pt-3 text-muted">
            {deliveryNote}
          </li>
        </ul>
      </div>

      <QuickOrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        itemSummary={`${name} — ${colorLabel ?? ""} · ${sizeLabel ?? ""} · ${formatKzt(price)}`}
        onConfirm={async (meta: CartMeta) => {
          const item = toCartItem(1);
          if (!item) return;

          // Same handling as the cart: claim the tab inside the click, file
          // the order, then send the buyer on with its number in the message.
          // Buying straight from the product page used to leave no record at
          // all, not even in the buyer's own browser.
          const tab = openLater();
          const recorded = await recordOrder({
            locale,
            source: "quick",
            meta,
            items: [item],
          });

          saveOrder({
            status: "sent_whatsapp",
            number: recorded?.number,
            meta,
            items: [item],
            totalKzt: recorded?.totalKzt ?? item.unitPriceKzt * item.qty,
          });

          const msg = buildSingleItemMessage({
            locale,
            item,
            labels: labels(),
            meta,
            orderNumber: recorded?.number,
          });
          tab.go(buildWaUrl(waE164, msg));
          setOrderOpen(false);
        }}
      />
    </div>
  );
}
