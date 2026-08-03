type Size = { key: string; label: string };

const BAR_MAX_PX = 96;
const REFERENCE_CM = 75;

/**
 * Heights drawn against 75 cm so the difference between cabin and check-in is
 * something you can see, not something you have to compute.
 */
export function SizeCompare({ sizes }: { sizes: Size[] }) {
  const parsed = sizes
    .map((s) => ({ ...s, cm: Number.parseFloat(s.key) }))
    .filter((s) => Number.isFinite(s.cm))
    .sort((a, b) => a.cm - b.cm);

  if (parsed.length < 2) return null;

  const maxCm = Math.max(REFERENCE_CM, parsed[parsed.length - 1].cm);

  return (
    <div className="flex items-end gap-4">
      {parsed.map((s) => (
        <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
          <span className="t-data text-muted">{s.cm}</span>
          <div
            className="shell-body w-full max-w-[3.25rem] rounded-t-sm rounded-b-[3px] border border-line-strong"
            style={{ height: `${(s.cm / maxCm) * BAR_MAX_PX}px` }}
            aria-hidden="true"
          />
          <p className="text-center text-[0.6875rem] leading-tight text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
