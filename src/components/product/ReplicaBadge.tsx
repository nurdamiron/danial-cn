export function ReplicaBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex border border-[#111] px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase">
      {label}
    </span>
  );
}
