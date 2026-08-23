/**
 * The storefront's own record of what visitors did.
 *
 * Five steps, in the order a buyer walks them. Keeping the list closed — and
 * shared by the browser that sends them and the route that stores them — is
 * what makes the funnel arithmetic honest: a step nobody defined cannot
 * quietly appear in the middle of it and make the drop-off look smaller than
 * it is.
 */
export const EVENT_TYPES = [
  /** Any storefront page. The top of the funnel. */
  "store_view",
  /** One product's page. */
  "product_view",
  "cart_add",
  /** The order form was opened, in the cart or in the quick-order modal. */
  "checkout_open",
  /** Handed over to WhatsApp — the last thing this site can see. */
  "whatsapp_click",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const DEVICES = ["phone", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

/**
 * The funnel, widest first. Read by both the dashboard and the tests, so the
 * order cannot drift out of step with the arithmetic done on it.
 */
export const FUNNEL_STEPS: readonly EventType[] = [
  "store_view",
  "product_view",
  "cart_add",
  "checkout_open",
  "whatsapp_click",
];

export const EVENT_LABELS_RU: Record<EventType, string> = {
  store_view: "Зашли в магазин",
  product_view: "Открыли товар",
  cart_add: "Положили в корзину",
  checkout_open: "Начали оформление",
  whatsapp_click: "Ушли в WhatsApp",
};

/**
 * A visit is one browser, one sitting. Long enough to follow somebody from the
 * front page to the WhatsApp button, short enough that it never becomes a way
 * to recognise the same person tomorrow.
 */
export const VISIT_ID_KEY = "danial_visit";

/** Room for a hostname, and not a byte more than a hostname needs. */
export const MAX_SOURCE_LENGTH = 120;
export const MAX_SLUG_LENGTH = 200;
