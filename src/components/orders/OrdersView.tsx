"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { formatKzt } from "@/lib/money";
import { loadOrders, type LocalOrder } from "@/store/orders";

export function OrdersView() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    const sync = () => setOrders(loadOrders());
    sync();
    window.addEventListener("danial-orders-updated", sync);
    return () => window.removeEventListener("danial-orders-updated", sync);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="t-display t-h3">{t("empty")}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          {t("emptyHint")}
        </p>
        <Link
          href="/catalog"
          className={buttonClass("primary", "md", "mt-6 inline-flex")}
        >
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="t-data text-muted">
                {new Date(o.createdAt).toLocaleString(
                  locale === "kk" ? "kk-KZ" : "ru-RU",
                )}
              </p>
              <p className="t-display mt-1.5 text-base">
                {o.meta.name || "—"} · {o.meta.city || "—"}
              </p>
              <p className="t-micro mt-1 text-muted">
                {o.items.length} {t("items")} ·{" "}
                <span className="t-price text-ink">{formatKzt(o.totalKzt)}</span>
              </p>
            </div>
            <span className="tag">{t("statusWhatsapp")}</span>
          </div>
          <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[0.8125rem] text-muted">
            {o.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-4">
                <span className="min-w-0 truncate">
                  {i.name} · {i.colorLabel} · {i.sizeLabel}
                </span>
                <span className="tabular shrink-0">× {i.qty}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
