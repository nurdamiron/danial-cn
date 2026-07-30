export function ReplicaBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex border border-black/15 bg-white/90 px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase backdrop-blur-sm">
      {label}
    </span>
  );
}
