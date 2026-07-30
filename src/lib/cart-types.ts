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
};

export type CartMeta = {
  name: string;
  city: string;
  phone?: string;
  delivery: DeliveryMode;
  comment?: string;
};

export const CART_STORAGE_KEY = "danial_cn_cart_v1";
