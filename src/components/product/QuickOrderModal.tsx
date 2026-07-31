"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { CartMeta, DeliveryMode } from "@/lib/cart-types";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (meta: CartMeta) => void;
  itemSummary: string;
};

export function QuickOrderModal({
  open,
  onClose,
  onConfirm,
  itemSummary,
}: Props) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMode>("express");

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && city.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    onConfirm({
      name: name.trim(),
      city: city.trim(),
      phone: phone.trim() || undefined,
      delivery,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label={t("catalog.close")}
        onClick={onClose}
      />
      <div className="dropdown-in relative w-full max-w-sm border border-line bg-paper p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm tracking-wide">{t("cta.buyWhatsApp")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink"
          >
            {t("catalog.close")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">{itemSummary}</p>

        <div className="mt-5 space-y-4">
          <label className="block text-xs tracking-wide">
            {t("cart.name")} *
            <input
              autoFocus
              className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-xs tracking-wide">
            {t("cart.city")} *
            <input
              className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="block text-xs tracking-wide">
            {t("cart.phone")}
            <input
              className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-[var(--ink)]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                  name="quick-order-delivery"
                  checked={delivery === mode}
                  onChange={() => setDelivery(mode)}
                  className="accent-ink"
                />
                {t(`delivery.${mode}`)}
              </label>
            ))}
          </fieldset>
        </div>

        <Button
          type="button"
          className="mt-6 w-full"
          disabled={!canSubmit}
          onClick={submit}
        >
          {t("cta.buyWhatsApp")}
        </Button>
      </div>
    </div>
  );
}
