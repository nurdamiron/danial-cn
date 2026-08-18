"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";
import { formatKzt } from "@/lib/money";
import { orderStatusLabel } from "@/lib/orders";
import { loadOrders, type LocalOrder } from "@/store/orders";

type ServerOrder = {
  id: string;
  number: string;
  status: string;
  totalKzt: number;
  city: string;
  customerName: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    colorLabel: string;
    sizeLabel: string;
    qty: number;
  }[];
};

/** One row on this page, from either source. */
type Row = {
  key: string;
  number?: string;
  createdAt: string;
  name: string;
  city: string;
  totalKzt: number;
  status?: string;
  items: { key: string; label: string; qty: number }[];
};

function fromServer(order: ServerOrder): Row {
  return {
    key: order.id,
    number: order.number,
    createdAt: order.createdAt,
    name: order.customerName,
    city: order.city,
    totalKzt: order.totalKzt,
    status: order.status,
    items: order.items.map((i) => ({
      key: i.id,
      label: [i.name, i.colorLabel, i.sizeLabel].filter(Boolean).join(" · "),
      qty: i.qty,
    })),
  };
}

function fromLocal(order: LocalOrder): Row {
  return {
    key: order.id,
    number: order.number,
    createdAt: order.createdAt,
    name: order.meta.name,
    city: order.meta.city,
    totalKzt: order.totalKzt,
    items: order.items.map((i) => ({
      key: i.variantId,
      label: [i.name, i.colorLabel, i.sizeLabel].filter(Boolean).join(" · "),
      qty: i.qty,
    })),
  };
}

export function OrdersView() {
  const t = useTranslations("orders");
  const locale = useLocale();
  const [local, setLocal] = useState<LocalOrder[]>([]);
  const [server, setServer] = useState<ServerOrder[]>([]);

  useEffect(() => {
    const sync = () => setLocal(loadOrders());
    sync();
    window.addEventListener("danial-orders-updated", sync);
    return () => window.removeEventListener("danial-orders-updated", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = (await res.json()) as { orders?: ServerOrder[] };
        if (!cancelled) setServer(data.orders ?? []);
      } catch {
        // The browser's own copy is still shown below.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The shop's copy wins where both exist: it is the one carrying a status.
  // Anything only this browser knows about — ordered as a guest, or filed
  // while the site could not reach its database — is kept alongside.
  const filed = new Set(server.map((o) => o.number));
  const rows: Row[] = [
    ...server.map(fromServer),
    ...local
      .filter((o) => !o.number || !filed.has(o.number))
      .map(fromLocal),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (rows.length === 0) {
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
      {rows.map((row) => (
        <li key={row.key} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="t-data text-muted">
                {new Date(row.createdAt).toLocaleString(
                  locale === "kk" ? "kk-KZ" : "ru-RU",
                )}
                {row.number ? ` · ${row.number}` : ""}
              </p>
              <p className="t-display mt-1.5 text-base">
                {row.name || "—"} · {row.city || "—"}
              </p>
              <p className="t-micro mt-1 text-muted">
                {row.items.length} {t("items")} ·{" "}
                <span className="t-price text-ink">
                  {formatKzt(row.totalKzt)}
                </span>
              </p>
            </div>
            <span className="tag">
              {row.status
                ? orderStatusLabel(row.status, locale)
                : t("statusWhatsapp")}
            </span>
          </div>
          <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[0.8125rem] text-muted">
            {row.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-4">
                <span className="min-w-0 truncate">{item.label}</span>
                <span className="tabular shrink-0">× {item.qty}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
