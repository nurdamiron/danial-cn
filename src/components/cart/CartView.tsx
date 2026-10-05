"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  MinusIcon,
  PlusIcon,
  ShellMark,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { DeliveryPicker } from "@/components/order/DeliveryPicker";
import type { CartItem, CartMeta } from "@/lib/cart-types";
import { formatKzt } from "@/lib/money";
import { buildOrderMessage, buildWaUrl } from "@/lib/whatsapp";
import { openLater, recordOrder } from "@/lib/record-order";
import { track } from "@/lib/track";
import {
  cartSubtotal,
  clearCart,
  loadCart,
  removeItem,
  updateQty,
} from "@/store/cart";
import { saveOrder } from "@/store/orders";
import { loadProfile, saveProfile } from "@/store/profile";

export function CartView({
  waE164,
  kaspiNote,
}: {
  waE164: string;
  kaspiNote: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as "ru" | "kk";
  const [items, setItems] = useState<CartItem[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState<{ number?: string } | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
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
    const p = loadProfile();
    setMeta((m) => ({
      ...m,
      name: m.name || p.name,
      phone: m.phone || p.phone,
      city: m.city || p.city,
    }));
    window.addEventListener("danial-cart-updated", sync);
    return () => window.removeEventListener("danial-cart-updated", sync);
  }, []);

  // Reaching this screen with something in the cart is the step: the form and
  // the send button are both here, so there is nothing further to open.
  /*
    On a phone the form and its send button come after every item, so with
    two or three bags in the basket neither the total nor the way to finish
    is on screen. A bar carries both until the form itself scrolls into view.
  */
  const formRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [formInView, setFormInView] = useState(true);
  const showsForm = items.length > 0 && !sent;
  useEffect(() => {
    const node = formRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      // A form peeking out from behind the tab bar is not one anybody can
      // see: it counts once it clears the bottom 9rem of the screen.
      { threshold: 0, rootMargin: "0px 0px -144px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [showsForm]);

  const checkoutReported = useRef(false);
  useEffect(() => {
    if (checkoutReported.current || items.length === 0) return;
    checkoutReported.current = true;
    track("checkout_open");
  }, [items.length]);

  /*
    Checked before the empty basket, because sending an order empties it: the
    buyer would otherwise be told their basket is empty with no word about the
    order they just placed.
  */
  if (sent) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="t-display t-h3">{t("cart.sentTitle")}</p>
        {sent.number ? (
          <p className="t-data mt-3 text-muted">
            {t("cart.sentNumber")} {sent.number}
          </p>
        ) : null}
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          {t("cart.sentBody")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/orders" className={buttonClass("primary", "md")}>
            {t("cart.toOrders")}
          </Link>
          <Link href="/catalog" className={buttonClass("outline", "md")}>
            {t("cta.continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card px-6 py-20 text-center">
        <p className="t-display t-h3">{t("cart.empty")}</p>
        <p className="mt-2 text-sm text-muted">{t("orders.emptyHint")}</p>
        <Link
          href="/catalog"
          className={buttonClass("primary", "md", "mt-7 inline-flex")}
        >
          {t("cta.continueShopping")}
        </Link>
      </div>
    );
  }

  const canSend = Boolean(meta.name.trim() && meta.city.trim());

  async function send() {
    if (!canSend || sending) return;
    setSending(true);
    setSendError("");

    // The last thing this site can see. After the handoff the conversation
    // continues in WhatsApp, where nothing here can follow it.
    track("whatsapp_click");

    // Claimed inside the click. The order is filed first so its number can go
    // into the message, and a tab opened after that await would be blocked.
    const tab = openLater();

    const cleanMeta = {
      ...meta,
      name: meta.name.trim(),
      city: meta.city.trim(),
    };

    const filed = await recordOrder({
      locale,
      source: "cart",
      meta: cleanMeta,
      items,
    });

    // The shop looked at this basket and said no — usually a variant that is
    // gone or more of it than there is. Handing the customer to WhatsApp now
    // would send an order nobody can fill, so the tab claimed for it is given
    // back and the reason is shown where the basket can still be fixed.
    if (filed.status === "rejected") {
      tab.cancel();
      setSendError(filed.error);
      setSending(false);
      return;
    }

    // Still sent when the shop could not answer at all: an outage should cost
    // the record, not the sale.
    const recorded = filed.status === "recorded" ? filed.order : null;

    const msg = buildOrderMessage({
      locale,
      orderNumber: recorded?.number,
      meta: cleanMeta,
      items,
      labels: {
        title:
          locale === "kk"
            ? "Danial CN — жаңа тапсырыс"
            : "Danial CN — новый заказ",
        delivery: {
          cargo: t("delivery.cargo"),
          avia: t("delivery.avia"),
          express: t("delivery.express"),
        },
        replicaLine:
          locale === "kk"
            ? "Danial CN · премиум багаж"
            : "Danial CN · премиум-багаж",
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
    saveProfile({
      name: cleanMeta.name,
      phone: cleanMeta.phone ?? "",
      city: cleanMeta.city,
    });
    // Kept as well as the server copy: it is what the customer sees in their
    // own order list, and it still works when the order could not be filed.
    saveOrder({
      status: "sent_whatsapp",
      number: recorded?.number,
      meta: cleanMeta,
      items: [...items],
      totalKzt: recorded?.totalKzt ?? cartSubtotal(items),
    });
    tab.go(buildWaUrl(waE164, msg));
    setItems(clearCart());
    setSent({ number: recorded?.number });
    setSending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
      {/* Items — min-w-0 lets the grid track shrink on narrow phones */}
      <ul className="min-w-0 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-3 py-5 sm:gap-5">
            <Link
              href={`/catalog/${item.slug}`}
              className="media relative flex h-24 w-20 shrink-0 items-center justify-center sm:h-32 sm:w-28"
            >
              {brokenImages.has(item.variantId) ? (
                <ShellMark className="h-8 w-8 text-line-strong" />
              ) : (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                  sizes="112px"
                  onError={() =>
                    setBrokenImages((prev) => new Set(prev).add(item.variantId))
                  }
                />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="t-label text-muted">{item.brand}</p>
                  <Link
                    href={`/catalog/${item.slug}`}
                    className="t-display mt-0.5 line-clamp-2 text-base hover:opacity-60"
                  >
                    {item.name}
                  </Link>
                  <p className="t-micro mt-1 text-muted">
                    {item.colorLabel} · {item.sizeLabel} · {item.material}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t("favorites.remove")}
                  className="btn btn-ghost h-11 w-11 md:h-9 md:w-9 shrink-0 p-0 text-muted"
                  onClick={() => setItems(removeItem(item.variantId))}
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div
                  className="inline-flex items-center rounded-full border border-line"
                  role="group"
                  aria-label={t("cart.qty")}
                >
                  <button
                    type="button"
                    aria-label="−"
                    className="flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone disabled:opacity-30"
                    disabled={item.qty <= 1}
                    onClick={() =>
                      setItems(updateQty(item.variantId, item.qty - 1))
                    }
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="tabular w-8 text-center text-sm">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    className="flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone"
                    onClick={() =>
                      setItems(updateQty(item.variantId, item.qty + 1))
                    }
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="t-price text-base">
                  {formatKzt(item.unitPriceKzt * item.qty)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Order form */}
      <div
        ref={formRef}
        className="min-w-0 scroll-mt-20 lg:sticky lg:top-32 lg:self-start"
      >
        <div className="card p-6">
          <h2 className="t-display t-h3">{t("cta.sendWhatsApp")}</h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="field-label">{t("cart.name")} *</span>
              <input
                ref={nameRef}
                className="field"
                value={meta.name}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="field-label">{t("cart.city")} *</span>
              <input
                className="field"
                value={meta.city}
                autoComplete="address-level2"
                autoCapitalize="words"
                enterKeyHint="next"
                onChange={(e) => setMeta({ ...meta, city: e.target.value })}
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
                value={meta.phone ?? ""}
                onChange={(e) => setMeta({ ...meta, phone: e.target.value })}
              />
            </label>

            <DeliveryPicker
              name="delivery"
              value={meta.delivery}
              onChange={(mode) => setMeta({ ...meta, delivery: mode })}
            />

            <label className="block">
              <span className="field-label">{t("cart.comment")}</span>
              <textarea
                className="field resize-y"
                rows={3}
                value={meta.comment ?? ""}
                onChange={(e) => setMeta({ ...meta, comment: e.target.value })}
              />
            </label>
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-sm text-muted">{t("cart.subtotal")}</span>
            <span className="t-price text-2xl">
              {formatKzt(cartSubtotal(items))}
            </span>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-5 w-full"
            disabled={!canSend || sending}
            onClick={() => void send()}
          >
            <WhatsAppIcon />
            {t("cta.sendWhatsApp")}
          </Button>

          {sendError ? (
            <p role="alert" className="alert-error mt-4">
              {sendError}
            </p>
          ) : null}

          <p className="mt-4 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-muted">
            <KaspiBadge height={18} className="mt-0.5" />
            {kaspiNote}
          </p>
        </div>
      </div>

      <div
        aria-hidden={formInView}
        className={`fixed inset-x-0 bottom-[calc(3.875rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-paper/95 backdrop-blur-xl transition-transform duration-300 md:hidden ${
          formInView
            ? "translate-y-[calc(100%+3.875rem+env(safe-area-inset-bottom))]"
            : "translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="t-micro text-muted">{t("cart.subtotal")}</p>
            <p className="t-price text-lg leading-none">
              {formatKzt(cartSubtotal(items))}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="ml-auto flex-1"
            tabIndex={formInView ? -1 : 0}
            disabled={formInView}
            onClick={() => {
              formRef.current?.scrollIntoView({ behavior: "smooth" });
              // The name is the first thing missing on a first order
              if (!meta.name.trim()) {
                nameRef.current?.focus({ preventScroll: true });
              }
            }}
          >
            {t("cart.checkout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
