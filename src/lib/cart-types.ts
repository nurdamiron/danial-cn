export type DeliveryMode = "cargo" | "avia" | "express";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  brand: string;
  name: string;
  colorLabel: string;
  sizeLabel: string;
  material: string;
  unitPriceKzt: number;
  qty: number;
  imageUrl: string;
  productUrl: string;
  /**
   * How many were in stock when it was added. The basket has no other way to
   * know, and without it the + button went past what the shop had: the
   * customer filled in the whole form before hearing "в наличии только 2".
   * Optional because baskets saved before it existed do not carry it.
   */
  maxQty?: number;
};

export type CartMeta = {
  name: string;
  city: string;
  phone?: string;
  delivery: DeliveryMode;
  comment?: string;
};

export const CART_STORAGE_KEY = "danial_cn_cart_v1";
