"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatKzt } from "@/lib/money";
import { loadOrders, type LocalOrder } from "@/store/orders";

export function OrdersView() {
  const t = useTranslations("orders");
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    const sync = () => setOrders(loadOrders());
    sync();
    window.addEventListener("danial-orders-updated", sync);
    return () => window.removeEventListener("danial-orders-updated", sync);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="border border-line bg-paper py-16 text-center">
        <p className="text-sm text-muted">{t("empty")}</p>
        <p className="mt-2 px-6 text-xs text-muted">{t("emptyHint")}</p>
        <Link
          href="/catalog"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="border border-line bg-paper p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">
                {new Date(o.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-light">
                {o.meta.name || "—"} · {o.meta.city || "—"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {o.items.length} {t("items")} · {formatKzt(o.totalKzt)}
              </p>
            </div>
            <span className="shrink-0 border border-line px-2 py-0.5 text-[10px] tracking-wide uppercase text-muted">
              {t("statusWhatsapp")}
            </span>
          </div>
          <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
            {o.items.map((i) => (
              <li key={i.variantId}>
                {i.name} · {i.colorLabel} · {i.sizeLabel} × {i.qty}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
