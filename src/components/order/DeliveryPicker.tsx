"use client";

import { useTranslations } from "next-intl";
import { CheckIcon } from "@/components/ui/icons";
import type { DeliveryMode } from "@/lib/cart-types";

/**
 * Choosing how the bag travels.
 *
 * It used to be three chips carrying nothing but a name, which asked the
 * customer to pick between words they had no way to compare. The two things
 * that actually differ are here instead: how long it takes, and that the rate
 * per kilo climbs as it gets faster. Neither is a promise — the shop quotes
 * the real sum in the chat once it knows the weight — so the note says so
 * rather than letting three tidy cards imply a price list.
 */

type Option = {
  mode: DeliveryMode;
  /** Rate per kilo, drawn rather than named: cheapest to dearest. */
  weight: 1 | 2 | 3;
};

const OPTIONS: Option[] = [
  { mode: "cargo", weight: 1 },
  { mode: "avia", weight: 2 },
  { mode: "express", weight: 3 },
];

const ETA_KEY: Record<DeliveryMode, string> = {
  cargo: "delivery.cargoEta",
  avia: "delivery.aviaEta",
  express: "delivery.expressEta",
};

const COST_KEY: Record<DeliveryMode, string> = {
  cargo: "delivery.cargoCost",
  avia: "delivery.aviaCost",
  express: "delivery.expressCost",
};

function CostScale({ weight }: { weight: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={
            step <= weight
              ? "h-1 w-3.5 rounded-full bg-current"
              : "h-1 w-3.5 rounded-full bg-current opacity-20"
          }
        />
      ))}
    </span>
  );
}

export function DeliveryPicker({
  name,
  value,
  onChange,
}: {
  /** Radio group name — two pickers can be mounted on one page. */
  name: string;
  value: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
}) {
  const t = useTranslations();

  return (
    <fieldset>
      <legend className="field-label">{t("cart.deliveryMethod")}</legend>

      <div className="mt-2 grid gap-2">
        {OPTIONS.map(({ mode, weight }) => {
          const selected = value === mode;
          return (
            <label key={mode} className="group cursor-pointer">
              <input
                type="radio"
                name={name}
                className="peer sr-only"
                checked={selected}
                onChange={() => onChange(mode)}
              />
              <span
                className={[
                  "flex items-start gap-3 rounded-[var(--r-lg)] border p-3.5",
                  "transition-colors duration-200",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2",
                  selected
                    ? "border-ink bg-stone"
                    : "border-line bg-paper group-hover:border-line-strong",
                ].join(" ")}
              >
                {/* The dot doubles as the tick once the option is taken */}
                <span
                  className={[
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-line-strong",
                  ].join(" ")}
                >
                  {selected ? <CheckIcon className="h-2.5 w-2.5" /> : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">
                      {t(`delivery.${mode}`)}
                    </span>
                    <span className="t-data tabular shrink-0 whitespace-nowrap">
                      {t(ETA_KEY[mode])}
                    </span>
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-3">
                    <span className="t-micro text-muted">
                      {t(COST_KEY[mode])}
                    </span>
                    <span
                      className={
                        selected
                          ? "shrink-0 text-ink"
                          : "shrink-0 text-line-strong"
                      }
                    >
                      <CostScale weight={weight} />
                    </span>
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="t-micro mt-2 text-muted">{t("delivery.pickerNote")}</p>
    </fieldset>
  );
}
