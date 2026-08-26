/**
 * Turning a submitted basket into an order the shop can stand behind.
 *
 * Prices are never taken from the request. The browser sends what it wants to
 * buy; the catalogue decides what that costs. Otherwise the shop's own records
 * would say whatever the buyer typed into them.
 */
import { randomInt } from "crypto";

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

export type PricingCatalogProduct = {
  id: string;
  slug: string;
  brand: string;
  nameRu: string;
  nameKk: string;
  basePriceKzt: number;
  images: { url: string; isCover: boolean }[];
  variants: {
    id: string;
    colorLabelRu: string;
    colorLabelKk: string;
    sizeLabelRu: string;
    sizeLabelKk: string;
    priceKzt: number | null;
    stock: number;
  }[];
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

/**
 * The catalogue is passed in rather than read here.
 *
 * It used to be the committed snapshot, which is written at build time: a
 * price edited in /admin afterwards showed on the storefront while the order
 * was filed at the price from the last deploy. The customer agreed to one
 * number and the shop recorded another. The caller now hands over the live
 * catalogue and falls back to the snapshot only when the database is down.
 */
export function priceOrder(
  submitted: SubmittedItem[],
  locale: string,
  catalog: PricingCatalogProduct[],
): PricingResult {
  if (!submitted.length) {
    return { ok: false, error: "Корзина пуста" };
  }
  if (submitted.length > MAX_ITEMS) {
    return { ok: false, error: "Слишком много позиций в заказе" };
  }

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

    // A cart can outlive the product it was filled from. Pricing a variant
    // that no longer exists against the base price used to file an order with
    // a blank colour and size at a price nobody quoted.
    if (line.variantId && !variant) {
      return {
        ok: false,
        error: `Этой комплектации больше нет в наличии: ${product.nameRu}`,
      };
    }

    // Stock was shown on the product page and then never checked again: the
    // quantity stepper in the cart has no upper bound of its own.
    if (variant) {
      if (variant.stock <= 0) {
        return {
          ok: false,
          error: `Товара нет в наличии: ${product.nameRu}`,
        };
      }
      if (qty > variant.stock) {
        return {
          ok: false,
          error: `В наличии только ${variant.stock} шт.: ${product.nameRu}`,
        };
      }
    }

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
