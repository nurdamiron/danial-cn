/**
 * The panel's shared furniture.
 *
 * These exist because every admin screen was hand-rolling the same shapes out
 * of raw utilities — `text-[11px] tracking-[0.16em] uppercase` in one file,
 * `text-xs` in the next — which is how eight screens ended up looking like
 * eight products. The design system already had `.t-label`, `.card`, `.field`
 * and `.alert-error`; what was missing was somewhere to put the compositions
 * built from them.
 */

/** A titled block. The rule under the heading is what separates sections. */
export function AdminSection({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  /** A control belonging to this section — a filter, a create button. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="t-label text-muted">{title}</h2>
        {hint ? <p className="text-[0.8125rem] text-muted">{hint}</p> : null}
        {action}
      </div>
      {children}
    </section>
  );
}

/** Says nothing is here, in a shape that does not read as a broken screen. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="card mt-4 px-6 py-12 text-center">
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

/**
 * What went wrong, stated plainly.
 *
 * Errors were previously red-on-red boxes assembled from Tailwind's palette,
 * which is a different red from the one the rest of the site uses for danger.
 */
export function Notice({
  tone = "error",
  children,
}: {
  tone?: "error" | "quiet";
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      role="status"
      className={
        tone === "error"
          ? "alert-error"
          : "border border-line bg-stone px-3.5 py-2.5 text-[0.8125rem]"
      }
    >
      {children}
    </p>
  );
}
