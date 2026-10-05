"use client";

import { useEffect, useRef, useState } from "react";
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
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Straight into the first field with a mouse and keyboard. On a phone
    // that threw the keyboard over half the sheet before the buyer had read
    // what they were ordering, so there the first tap does it.
    if (window.matchMedia("(pointer: fine)").matches) nameRef.current?.focus();
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
      {/*
        dvh, not vh: on a phone vh is the height with the browser's bars
        hidden, so a 92vh sheet ran under the address bar. Only the fields
        scroll; the button stays at the foot of the sheet, where it used to
        sit below all three delivery cards and out of sight.
      */}
      <div className="sheet-in relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-xl border border-line bg-paper shadow-2xl sm:rounded-xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="t-display t-h3">{t("cta.buyWhatsApp")}</h2>
              <p className="t-micro mt-1.5 text-muted">{itemSummary}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("catalog.close")}
              className="btn btn-ghost -mt-1 h-11 w-11 md:h-9 md:w-9 shrink-0 p-0 text-muted"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="field-label">{t("cart.name")} *</span>
              <input
                ref={nameRef}
                className="field"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="field-label">{t("cart.city")} *</span>
              <input
                className="field"
                autoComplete="address-level2"
                autoCapitalize="words"
                enterKeyHint="next"
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
        </div>

        {/* Kept off the home indicator on a phone */}
        <div className="border-t border-line px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
            onClick={submit}
          >
            <WhatsAppIcon />
            {t("cta.buyWhatsApp")}
          </Button>
        </div>
      </div>
    </div>
  );
}
