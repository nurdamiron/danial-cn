"use client";

import type { CartItem, CartMeta } from "@/lib/cart-types";

export type RecordedOrder = { number: string; totalKzt: number };

/**
 * Files the order with the shop before the customer is handed to WhatsApp.
 *
 * Returns null on any failure, and callers carry on to WhatsApp regardless: a
 * database hiccup should cost the shop a record, never a sale. Only what to
 * buy is sent — the prices come from the catalogue on the server.
 */
export async function recordOrder(input: {
  locale: string;
  source: "cart" | "quick";
  meta: CartMeta;
  items: CartItem[];
}): Promise<RecordedOrder | null> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: input.locale === "kk" ? "kk" : "ru",
        source: input.source,
        meta: {
          name: input.meta.name,
          city: input.meta.city,
          phone: input.meta.phone ?? "",
          delivery: input.meta.delivery,
          comment: input.meta.comment ?? "",
        },
        items: input.items.map((item) => ({
          slug: item.slug,
          variantId: item.variantId || undefined,
          qty: item.qty,
        })),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { order?: RecordedOrder };
    return data.order ?? null;
  } catch {
    return null;
  }
}

/**
 * Opens the tab inside the click that asked for it, then points it at the
 * final URL once the order has been filed. Opening after an await is what
 * pop-up blockers are built to stop.
 */
export function openLater(): { go: (url: string) => void } {
  const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
  return {
    go(url: string) {
      if (win && !win.closed) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    },
  };
}
