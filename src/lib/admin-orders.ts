/**
 * The shape of an order as the admin panel reads it. Shared so the page and
 * the API cannot drift, and so the customer's IP stays out of the payload the
 * browser receives — it is kept for abuse triage, not for display.
 */
export const ADMIN_ORDER_INCLUDE = {
  select: {
    id: true,
    number: true,
    customerName: true,
    customerPhone: true,
    city: true,
    delivery: true,
    comment: true,
    totalKzt: true,
    status: true,
    source: true,
    createdAt: true,
    user: { select: { id: true, email: true } },
    items: {
      select: {
        id: true,
        slug: true,
        brand: true,
        name: true,
        colorLabel: true,
        sizeLabel: true,
        unitPriceKzt: true,
        qty: true,
      },
    },
  },
} as const;

export type AdminOrderItem = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  colorLabel: string;
  sizeLabel: string;
  unitPriceKzt: number;
  qty: number;
};

export type AdminOrder = {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  city: string;
  delivery: string;
  comment: string;
  totalKzt: number;
  status: string;
  source: string;
  createdAt: string;
  user: { id: string; email: string } | null;
  items: AdminOrderItem[];
};

export const DELIVERY_LABEL: Record<string, string> = {
  cargo: "карго",
  avia: "авиа",
  express: "экспресс",
};
