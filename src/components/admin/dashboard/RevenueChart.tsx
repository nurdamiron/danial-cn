import type { DayPoint } from "@/lib/analytics";
import { formatKzt } from "@/lib/money";

/**
 * Revenue by day, drawn as bars.
 *
 * Bars rather than a line: a line implies a value between two days, and there
 * is no such thing as half past Tuesday's takings. Each day either sold
 * something or it did not, and the gaps are part of what the owner is reading.
 *
 * Inline SVG rather than a charting library — the whole drawing is a list of
 * rectangles, and a dependency for that would cost more to load than the page
 * it sits on.
 */

const VIEW_W = 720;
const VIEW_H = 150;
const GAP = 2;

function weekday(date: string): boolean {
  const day = new Date(date).getUTCDay();
  return day !== 0 && day !== 6;
}

export function RevenueChart({ series }: { series: DayPoint[] }) {
  const peak = Math.max(...series.map((d) => d.revenue), 1);
  const width = VIEW_W / series.length;
  const best = series.reduce((a, b) => (b.revenue > a.revenue ? b : a), series[0]);

  return (
    <figure className="mt-6">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="h-[120px] w-full sm:h-[150px]"
        role="img"
        aria-label={`Выручка по дням. Лучший день ${best?.date ?? ""}, ${formatKzt(best?.revenue ?? 0)}.`}
      >
        {series.map((d, i) => {
          const height = d.revenue > 0 ? (d.revenue / peak) * (VIEW_H - 8) : 0;
          return (
            <rect
              key={d.date}
              x={i * width}
              y={VIEW_H - height}
              width={Math.max(width - GAP, 1)}
              height={height}
              /* Weekends sit back a shade: this shop's week has a rhythm, and
                 flattening it hides the pattern the owner plans around. */
              fill={weekday(d.date) ? "var(--ink)" : "var(--alu)"}
            >
              <title>{`${d.date}: ${formatKzt(d.revenue)}, заказов ${d.orders}`}</title>
            </rect>
          );
        })}
      </svg>
      {/* The baseline carries the flute — the same rib pattern as the shells */}
      <div className="flute h-2 w-full" aria-hidden="true" />
      <figcaption className="mt-2 flex justify-between">
        <span className="t-data text-muted">{series[0]?.date}</span>
        <span className="t-data text-muted">
          пик {formatKzt(peak)}
        </span>
        <span className="t-data text-muted">{series.at(-1)?.date}</span>
      </figcaption>
    </figure>
  );
}
