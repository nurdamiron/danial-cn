/**
 * Turning a submitted basket into an order the shop can stand behind.
 *
 * Prices are never taken from the request. The browser sends what it wants to
 * buy; the catalogue decides what that costs. Otherwise the shop's own records
 * would say whatever the buyer typed into them.
 */
import { randomInt } from "crypto";
import { getStaticProducts } from "@/lib/static-catalog";

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "shipped",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "новый",
  confirmed: "подтверждён",
  shipped: "отправлен",
  done: "выполнен",
  cancelled: "отменён",
};

/** Shown to the customer, who reads the site in one of two languages. */
export const ORDER_STATUS_LABEL_KK: Record<OrderStatus, string> = {
  new: "жаңа",
  confirmed: "расталды",
  shipped: "жіберілді",
  done: "орындалды",
  cancelled: "бас тартылды",
};

export function orderStatusLabel(status: string, locale: string): string {
  const key = status as OrderStatus;
  const table = locale === "kk" ? ORDER_STATUS_LABEL_KK : ORDER_STATUS_LABEL;
  return table[key] ?? status;
}

export type SubmittedItem = {
  slug: string;
  variantId?: string;
  qty: number;
};

export type PricedItem = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  colorLabel: string;
  sizeLabel: string;
  unitPriceKzt: number;
  qty: number;
  imageUrl: string;
};

export type PricingResult =
  | { ok: true; items: PricedItem[]; totalKzt: number }
  | { ok: false; error: string };

const MAX_ITEMS = 30;
const MAX_QTY_PER_ITEM = 20;

/**
 * A code a person can read out over the phone. Random rather than sequential:
 * a counter would need a transaction to stay unique under concurrent orders,
 * and would also tell every customer how many orders the shop has taken.
 */
export function generateOrderNumber(now = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY3456789";
  let tail = "";
  for (let i = 0; i < 4; i++) tail += alphabet[randomInt(alphabet.length)];
  return `DC-${yy}${mm}${dd}-${tail}`;
}

export function priceOrder(
  submitted: SubmittedItem[],
  locale: string,
): PricingResult {
  if (!submitted.length) {
    return { ok: false, error: "Корзина пуста" };
  }
  if (submitted.length > MAX_ITEMS) {
    return { ok: false, error: "Слишком много позиций в заказе" };
  }

  const catalog = getStaticProducts();
  const items: PricedItem[] = [];

  for (const line of submitted) {
    const qty = Math.floor(line.qty);
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return { ok: false, error: "Неверное количество" };
    }

    const product = catalog.find((p) => p.slug === line.slug);
    if (!product) {
      return { ok: false, error: `Товар не найден: ${line.slug}` };
    }

    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : undefined;

    const cover =
      product.images.find((i) => i.isCover)?.url ?? product.images[0]?.url ?? "";

    items.push({
      productId: product.id,
      slug: product.slug,
      brand: product.brand,
      name: locale === "kk" ? product.nameKk : product.nameRu,
      colorLabel: variant
        ? locale === "kk"
          ? variant.colorLabelKk
          : variant.colorLabelRu
        : "",
      sizeLabel: variant
        ? locale === "kk"
          ? variant.sizeLabelKk
          : variant.sizeLabelRu
        : "",
      unitPriceKzt: variant?.priceKzt ?? product.basePriceKzt,
      qty,
      imageUrl: cover,
    });
  }

  const totalKzt = items.reduce(
    (sum, item) => sum + item.unitPriceKzt * item.qty,
    0,
  );

  return { ok: true, items, totalKzt };
}
