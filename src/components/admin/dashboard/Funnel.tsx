import type { FunnelStep } from "@/lib/analytics";

/**
 * The path from the front page to WhatsApp, and what it costs at each step.
 *
 * The loss is printed between the bars rather than beside them, because that
 * is where it happens: the number the owner can act on is not "20 people
 * opened the cart", it is "60% of the people holding a bag put it down here".
 *
 * The last bar is where this site stops being able to see. What happens in
 * the chat afterwards is the shop's own business, and the panel says so
 * rather than pretending the funnel ends in a sale.
 */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <ol className="mt-6 space-y-0">
      {steps.map((step, i) => (
        <li key={step.type}>
          {step.lostPct !== null && step.lostPct > 0 ? (
            <p className="py-1.5 pl-3 text-[0.8125rem] text-muted">
              <span className="text-danger">−{step.lostPct}%</span> ушли, не
              дойдя до следующего шага
            </p>
          ) : null}

          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm">{step.label}</p>
            <p className="t-data shrink-0 text-muted">
              {step.visits} · {step.ofTopPct}%
            </p>
          </div>

          <div
            className="mt-1.5 h-9 bg-stone"
            role="presentation"
            /* Width is the share of the widest step, so the taper of the
               funnel is legible before a single number is read. */
          >
            <div
              className="h-full bg-ink transition-[width] duration-500"
              style={{
                width: `${Math.max(step.ofTopPct, step.visits > 0 ? 2 : 0)}%`,
                /* Each step sits a shade lighter than the one above, so five
                   identical bars do not read as one block of ink. */
                opacity: 1 - i * 0.13,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
