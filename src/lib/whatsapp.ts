import type { CartItem, CartMeta, DeliveryMode } from "@/lib/cart-types";
import { formatKzt } from "@/lib/money";

export type OrderMessageLabels = {
  title: string;
  delivery: Record<DeliveryMode, string>;
  replicaLine: string;
  paymentNote: string;
  fields: {
    name: string;
    city: string;
    phone: string;
    delivery: string;
    total: string;
  };
};

export function buildOrderMessage(input: {
  locale: "ru" | "kk";
  meta: CartMeta;
  items: CartItem[];
  labels: OrderMessageLabels;
  /** Code of the saved order, so the chat can be matched to the record. */
  orderNumber?: string | null;
}): string {
  const { meta, items, labels } = input;
  const lines: string[] = [labels.title];

  if (input.orderNumber) {
    lines.push(`№ ${input.orderNumber}`);
  }

  lines.push(
    `${labels.fields.name}: ${meta.name}`,
    `${labels.fields.city}: ${meta.city}`,
  );

  if (meta.phone) {
    lines.push(`${labels.fields.phone}: ${meta.phone}`);
  }

  lines.push(
    `${labels.fields.delivery}: ${labels.delivery[meta.delivery]}`,
    "",
  );

  let total = 0;
  items.forEach((item, index) => {
    const lineTotal = item.unitPriceKzt * item.qty;
    total += lineTotal;
    lines.push(
      `${index + 1}) ${item.brand} — ${item.name}`,
      `   ${item.colorLabel} | ${item.sizeLabel} | ${item.material}`,
      `   x${item.qty} | ${formatKzt(lineTotal)}`,
      `   ${labels.replicaLine}`,
      `   ${item.productUrl}`,
      "",
    );
  });

  lines.push(`${labels.fields.total}: ${formatKzt(total)}`);
  lines.push(labels.paymentNote);

  if (meta.comment?.trim()) {
    lines.push("", meta.comment.trim());
  }

  return lines.join("\n");
}

export function buildWaUrl(e164: string, message: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildSingleItemMessage(input: {
  locale: "ru" | "kk";
  item: CartItem;
  labels: OrderMessageLabels;
  meta?: Partial<CartMeta>;
  orderNumber?: string | null;
}): string {
  return buildOrderMessage({
    locale: input.locale,
    orderNumber: input.orderNumber,
    meta: {
      name: input.meta?.name ?? "—",
      city: input.meta?.city ?? "—",
      phone: input.meta?.phone,
      delivery: input.meta?.delivery ?? "express",
      comment: input.meta?.comment,
    },
    items: [input.item],
    labels: input.labels,
  });
}
