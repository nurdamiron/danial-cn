import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders";

/**
 * An order's state, as a luggage tag.
 *
 * The five states are not five decorations: only one of them is asking the
 * owner for something. "New" is filled ink so it carries across a list at a
 * glance; the states that mean the work is done recede to a hairline; only
 * "cancelled" takes the danger colour, because it is the one that changes
 * what the revenue figures mean.
 */
const TONE: Record<OrderStatus, string> = {
  new: "border-ink bg-ink text-paper",
  confirmed: "border-ink text-ink",
  shipped: "border-line-strong text-ink",
  done: "border-line text-muted",
  cancelled: "border-danger/30 bg-[var(--danger-tint)] text-danger",
};

export function StatusTag({ status }: { status: string }) {
  const known = status in ORDER_STATUS_LABEL ? (status as OrderStatus) : null;
  return (
    <span className={`tag ${known ? TONE[known] : "border-line"}`}>
      {known ? ORDER_STATUS_LABEL[known] : status}
    </span>
  );
}
