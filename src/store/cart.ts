"use client";

import {
  CART_STORAGE_KEY,
  type CartItem,
} from "@/lib/cart-types";
import { track } from "@/lib/track";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("danial-cart-updated"));
}

/**
 * Emptied once an order has been handed to WhatsApp.
 *
 * Without this the basket survived the order: the buyer came back to the same
 * items and the same "1" on the header, could not tell whether anything had
 * been sent, and the safe-looking move was to send it again — which arrived
 * as a second order for the same suitcase.
 */
export function clearCart(): CartItem[] {
  saveCart([]);
  return [];
}

export function addItem(item: CartItem): CartItem[] {
  // Reported here rather than at the buttons: the product page and the
  // quick-order modal both add through this function, and a funnel that
  // counted only one of them would misread the other as a drop-off.
  track("cart_add", { slug: item.slug });

  const items = loadCart();
  const idx = items.findIndex((i) => i.variantId === item.variantId);
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      qty: items[idx].qty + item.qty,
    };
  } else {
    items.push(item);
  }
  saveCart(items);
  return items;
}

export function updateQty(variantId: string, qty: number): CartItem[] {
  let items = loadCart();
  if (qty <= 0) {
    items = items.filter((i) => i.variantId !== variantId);
  } else {
    items = items.map((i) =>
      i.variantId === variantId ? { ...i, qty } : i,
    );
  }
  saveCart(items);
  return items;
}

export function removeItem(variantId: string): CartItem[] {
  const items = loadCart().filter((i) => i.variantId !== variantId);
  saveCart(items);
  return items;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPriceKzt * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
