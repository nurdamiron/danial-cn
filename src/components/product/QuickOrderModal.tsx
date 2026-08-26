"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { CloseIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { CartMeta, DeliveryMode } from "@/lib/cart-types";
import { DeliveryPicker } from "@/components/order/DeliveryPicker";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (meta: CartMeta) => void | Promise<void>;
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && city.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    void onConfirm({
      name: name.trim(),
      city: city.trim(),
      phone: phone.trim() || undefined,
      delivery,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("cta.buyWhatsApp")}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        aria-label={t("catalog.close")}
        onClick={onClose}
      />
      <div className="sheet-in relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-xl border border-line bg-paper p-6 shadow-2xl sm:rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="t-display t-h3">{t("cta.buyWhatsApp")}</h2>
            <p className="t-micro mt-1.5 text-muted">{itemSummary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("catalog.close")}
            className="btn btn-ghost -mt-1 h-9 w-9 shrink-0 p-0 text-muted"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="field-label">{t("cart.name")} *</span>
            <input
              autoFocus
              className="field"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">{t("cart.city")} *</span>
            <input
              className="field"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">{t("cart.phone")}</span>
            <input
              className="field"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 7__ ___ __ __"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <DeliveryPicker
            name="quick-order-delivery"
            value={delivery}
            onChange={setDelivery}
          />
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-6 w-full"
          disabled={!canSubmit}
          onClick={submit}
        >
          <WhatsAppIcon />
          {t("cta.buyWhatsApp")}
        </Button>
      </div>
    </div>
  );
}
