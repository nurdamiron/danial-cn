type Size = { key: string; label: string };

const BAR_MAX_PX = 72;

export function SizeCompare({ sizes }: { sizes: Size[] }) {
  const parsed = sizes
    .map((s) => ({ ...s, cm: Number.parseFloat(s.key) }))
    .filter((s) => Number.isFinite(s.cm))
    .sort((a, b) => a.cm - b.cm);

  if (parsed.length < 2) return null;

  const maxCm = parsed[parsed.length - 1].cm;

  return (
    <div className="flex items-end gap-5">
      {parsed.map((s) => (
        <div key={s.key} className="flex flex-col items-center gap-2">
          <div
            className="w-9 border border-line bg-stone sm:w-11"
            style={{ height: `${(s.cm / maxCm) * BAR_MAX_PX}px` }}
            aria-hidden="true"
          />
          <p className="max-w-[5.5rem] text-center text-[10px] leading-tight text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
