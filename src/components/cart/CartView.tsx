"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { BrandMark } from "@/components/ui/BrandMark";
import type { CartItem, CartMeta, DeliveryMode } from "@/lib/cart-types";
import { formatKzt } from "@/lib/money";
import { buildOrderMessage, buildWaUrl } from "@/lib/whatsapp";
import {
  cartSubtotal,
  loadCart,
  removeItem,
  updateQty,
} from "@/store/cart";


export function CartView({ waE164 }: { waE164: string }) {
  const t = useTranslations();
  const locale = useLocale() as "ru" | "kk";
  const [items, setItems] = useState<CartItem[]>([]);
  const [meta, setMeta] = useState<CartMeta>({
    name: "",
    city: "",
    phone: "",
    delivery: "express",
    comment: "",
  });

  useEffect(() => {
    const sync = () => setItems(loadCart());
    sync();
    window.addEventListener("danial-cart-updated", sync);
    return () => window.removeEventListener("danial-cart-updated", sync);
  }, []);

  if (items.length === 0) {
    return (
      <div className="border border-line bg-paper py-20 text-center">
        <p className="text-sm text-muted">{t("cart.empty")}</p>
        <Link
          href="/catalog"
          className="mt-4 inline-block text-sm tracking-wide underline underline-offset-4 hover:opacity-60"
        >
          {t("cta.continueShopping")}
        </Link>
      </div>
    );
  }

  function send() {
    if (!meta.name.trim() || !meta.city.trim()) return;
    const msg = buildOrderMessage({
      locale,
      meta: {
        ...meta,
        name: meta.name.trim(),
        city: meta.city.trim(),
      },
      items,
      labels: {
        title:
          locale === "kk" ? "Danial CN, жаңа тапсырыс" : "Danial CN, новый заказ",
        delivery: {
          cargo: t("delivery.cargo"),
          avia: t("delivery.avia"),
          express: t("delivery.express"),
        },
        replicaLine:
          locale === "kk" ? "Danial CN, премиум багаж" : "Danial CN, премиум багаж",
        paymentNote: t("payment.kaspiNote"),
        fields: {
          name: t("cart.name"),
          city: t("cart.city"),
          phone: t("cart.phone"),
          delivery: t("cart.deliveryMethod"),
          total: t("cart.subtotal"),
        },
      },
    });
    window.open(buildWaUrl(waE164, msg), "_blank");
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 border-b border-line pb-6"
          >
            <div className="relative h-28 w-24 shrink-0 bg-white">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-widest text-muted uppercase">
                    {item.brand}
                  </p>
                  <p className="text-sm">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.colorLabel}, {item.sizeLabel}, {item.material}
                  </p>
                </div>
              </div>
              <p className="text-sm">
                {formatKzt(item.unitPriceKzt * item.qty)}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-8 w-8 border border-line"
                  onClick={() => setItems(updateQty(item.variantId, item.qty - 1))}
                >
                  −
                </button>
                <span className="text-sm">{item.qty}</span>
                <button
                  type="button"
                  className="h-8 w-8 border border-line"
                  onClick={() => setItems(updateQty(item.variantId, item.qty + 1))}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-auto text-xs text-muted underline"
                  onClick={() => setItems(removeItem(item.variantId))}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 border border-line bg-white p-6">
        <label className="block text-xs tracking-wide">
          {t("cart.name")} *
          <input
            className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
            value={meta.name}
            onChange={(e) => setMeta({ ...meta, name: e.target.value })}
          />
        </label>
        <label className="block text-xs tracking-wide">
          {t("cart.city")} *
          <input
            className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
            value={meta.city}
            onChange={(e) => setMeta({ ...meta, city: e.target.value })}
          />
        </label>
        <label className="block text-xs tracking-wide">
          {t("cart.phone")}
          <input
            className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
            value={meta.phone ?? ""}
            onChange={(e) => setMeta({ ...meta, phone: e.target.value })}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="text-xs tracking-wide">
            {t("cart.deliveryMethod")}
          </legend>
          {(["cargo", "avia", "express"] as DeliveryMode[]).map((mode) => (
            <label key={mode} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="delivery"
                checked={meta.delivery === mode}
                onChange={() => setMeta({ ...meta, delivery: mode })}
              />
              {t(`delivery.${mode}`)}
            </label>
          ))}
        </fieldset>
        <label className="block text-xs tracking-wide">
          {t("cart.comment")}
          <textarea
            className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
            rows={3}
            value={meta.comment ?? ""}
            onChange={(e) => setMeta({ ...meta, comment: e.target.value })}
          />
        </label>
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <BrandMark name="pay-kaspi" height={18} label="Kaspi" colored />
          {t("payment.kaspiNote")}
        </p>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm">{t("cart.subtotal")}</span>
          <span className="text-lg">{formatKzt(cartSubtotal(items))}</span>
        </div>
        <Button
          type="button"
          className="w-full gap-2"
          disabled={!meta.name.trim() || !meta.city.trim()}
          onClick={send}
        >
          <WhatsAppIcon />
          {t("cta.sendWhatsApp")}
        </Button>
      </div>
    </div>
  );
}
