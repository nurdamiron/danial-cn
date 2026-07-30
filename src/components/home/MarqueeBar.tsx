export function MarqueeBar({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-ink text-paper">
      <div className="marquee flex whitespace-nowrap py-3">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-8 text-[10px] tracking-[0.28em] uppercase opacity-80"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
