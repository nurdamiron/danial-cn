import type { Trend } from "@/lib/analytics";

/**
 * A figure's movement against the same span before it.
 *
 * Deliberately not green-and-red. The panel is monochrome by design, and the
 * arrow already carries the direction — so only a fall gets a colour, because
 * a fall is the only one of the two that asks the owner to do something.
 */
export function Delta({
  trend,
  days,
  onDark = false,
}: {
  trend: Trend;
  days: number;
  onDark?: boolean;
}) {
  if (trend.deltaPct === null) {
    return (
      <p className={`t-data ${onDark ? "text-alu" : "text-muted"}`}>
        {/* Saying "+100%" against an empty period would be an invention. */}
        нет данных за прошлые {days} дн.
      </p>
    );
  }

  const up = trend.deltaPct >= 0;
  const tone = up
    ? onDark
      ? "text-paper"
      : "text-ink"
    : onDark
      ? "text-[#ff9d94]"
      : "text-danger";

  return (
    <p className={`t-data ${tone}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>{" "}
      {up ? "+" : ""}
      {trend.deltaPct}%{" "}
      <span className={onDark ? "text-alu" : "text-muted"}>
        к прошлым {days} дн.
      </span>
    </p>
  );
}
