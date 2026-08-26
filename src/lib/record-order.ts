"use client";

import type { CartItem, CartMeta } from "@/lib/cart-types";

export type RecordedOrder = { number: string; totalKzt: number };

/**
 * What came of filing the order.
 *
 * "unavailable" and "rejected" used to be the same `null`, and callers took
 * both as permission to carry on to WhatsApp. That is right for the first —
 * a database hiccup should cost the shop a record, never a sale — and wrong
 * for the second: an order the shop has already refused, because the basket
 * holds a variant that no longer exists or more of it than there is, would
 * arrive in the chat as if it had been accepted.
 */
export type RecordResult =
  | { status: "recorded"; order: RecordedOrder }
  | { status: "rejected"; error: string }
  | { status: "unavailable" };

const REJECTED_WITHOUT_REASON =
  "Не удалось оформить заказ. Обновите корзину и попробуйте снова.";

/**
 * Files the order with the shop before the customer is handed to WhatsApp.
 *
 * Only what to buy is sent — the prices come from the catalogue on the server.
 */
export async function recordOrder(input: {
  locale: string;
  source: "cart" | "quick";
  meta: CartMeta;
  items: CartItem[];
}): Promise<RecordResult> {
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
    // 4xx is the shop answering about this basket; 5xx is the shop failing to
    // answer at all. Only the first is the customer's to act on.
    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        return {
          status: "rejected",
          error: data?.error?.trim() || REJECTED_WITHOUT_REASON,
        };
      }
      return { status: "unavailable" };
    }

    const data = (await res.json()) as { order?: RecordedOrder };
    return data.order
      ? { status: "recorded", order: data.order }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * Opens the tab inside the click that asked for it, then points it at the
 * final URL once the order has been filed. Opening after an await is what
 * pop-up blockers are built to stop.
 */
export function openLater(): {
  go: (url: string) => void;
  cancel: () => void;
} {
  const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
  return {
    go(url: string) {
      if (win && !win.closed) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    },
    cancel() {
      if (win && !win.closed) win.close();
    },
  };
}
