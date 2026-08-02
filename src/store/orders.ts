import type { CartItem, CartMeta } from "@/lib/cart-types";

export const ORDERS_STORAGE_KEY = "danial_cn_orders_v1";

export type LocalOrder = {
  id: string;
  createdAt: string;
  status: "sent_whatsapp" | "pending";
  meta: CartMeta;
  items: CartItem[];
  totalKzt: number;
};

export function loadOrders(): LocalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Omit<LocalOrder, "id" | "createdAt">): LocalOrder {
  const full: LocalOrder = {
    ...order,
    id: `ord_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  const list = loadOrders();
  list.unshift(full);
  // keep last 50
  const trimmed = list.slice(0, 50);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("danial-orders-updated"));
  return full;
}
