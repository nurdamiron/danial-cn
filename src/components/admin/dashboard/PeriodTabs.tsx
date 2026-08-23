import Link from "next/link";

export const PERIODS = [7, 30, 90] as const;
export type PeriodDays = (typeof PERIODS)[number];

/** Anything else in the query string is somebody guessing. */
export function readPeriod(value: string | string[] | undefined): PeriodDays {
  const days = Number(Array.isArray(value) ? value[0] : value);
  return (PERIODS as readonly number[]).includes(days)
    ? (days as PeriodDays)
    : 30;
}

const LABELS: Record<PeriodDays, string> = {
  7: "7 дней",
  30: "30 дней",
  90: "90 дней",
};

/**
 * Plain links, not a control.
 *
 * The whole dashboard is rendered on the server; making the period a piece of
 * client state would ship a bundle to change a number that the server has to
 * recompute anyway. It also puts the period in the URL, so a view of a
 * particular week can be sent to somebody.
 */
export function PeriodTabs({ active }: { active: PeriodDays }) {
  return (
    <nav aria-label="Период" className="flex gap-1">
      {PERIODS.map((days) => (
        <Link
          key={days}
          href={`/admin?days=${days}`}
          aria-current={days === active ? "page" : undefined}
          className={`t-data border px-3 py-1.5 transition ${
            days === active
              ? "border-ink bg-ink text-paper"
              : "border-line text-muted hover:border-ink hover:text-ink"
          }`}
        >
          {LABELS[days]}
        </Link>
      ))}
    </nav>
  );
}
