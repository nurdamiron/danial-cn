"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoment } from "@/lib/datetime";
import { formatKzt } from "@/lib/money";
import {
  DELIVERY_LABEL,
  type AdminOrder,
} from "@/lib/admin-orders";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-ink text-paper",
  confirmed: "border border-ink text-ink",
  shipped: "border border-line text-muted",
  done: "border border-line text-muted",
  cancelled: "border border-red-300 text-red-700",
};

export function OrdersAdmin({ orders: initial }: { orders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (status) params.set("status", status);
        const res = await fetch(`/api/admin/orders?${params}`);
        const data = await res.json();
        if (res.ok) setOrders(data.orders ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, status]);

  async function setOrderStatus(id: string, next: OrderStatus) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setOrders((list) =>
        list.map((o) => (o.id === id ? { ...o, ...data.order } : o)),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="w-full border border-line bg-paper px-3 py-2 text-sm sm:max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Номер, имя, телефон или город"
        />
        <select
          className="border border-line bg-paper px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Все статусы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          {loading ? "Ищу…" : `Заказов: ${orders.length}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="border border-line bg-paper px-4 py-8 text-center text-sm text-muted">
          Заказов пока нет.
        </p>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => {
          const open = openId === order.id;
          return (
            <div key={order.id} className="border border-line bg-paper">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{order.number}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] tracking-wide uppercase ${
                        STATUS_STYLE[order.status] ?? "border border-line"
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status as OrderStatus] ??
                        order.status}
                    </span>
                    {order.source === "quick" ? (
                      <span className="text-[10px] tracking-wide text-muted uppercase">
                        быстрый заказ
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 text-sm">
                    {order.customerName}
                    {order.customerPhone ? `, ${order.customerPhone}` : ""}
                  </div>
                  <div className="text-xs text-muted">
                    {order.city}, {DELIVERY_LABEL[order.delivery] ?? order.delivery}
                    {" · "}
                    {formatMoment(order.createdAt)}
                    {order.user ? ` · ${order.user.email}` : " · гость"}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <div className="text-lg font-light">
                    {formatKzt(order.totalKzt)}
                  </div>
                  <select
                    className="border border-line px-2 py-1 text-xs"
                    value={order.status}
                    disabled={busyId === order.id}
                    onChange={(e) =>
                      void setOrderStatus(order.id, e.target.value as OrderStatus)
                    }
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => setOpenId(open ? null : order.id)}
                  >
                    {open ? "Свернуть" : `Состав, ${order.items.length}`}
                  </button>
                </div>
              </div>

              {open ? (
                <div className="border-t border-line px-4 py-3">
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3 text-xs">
                        <span>
                          {item.brand} {item.name}
                          {item.colorLabel ? `, ${item.colorLabel}` : ""}
                          {item.sizeLabel ? `, ${item.sizeLabel}` : ""}
                          {item.qty > 1 ? ` x${item.qty}` : ""}
                        </span>
                        <span className="shrink-0 text-muted">
                          {formatKzt(item.unitPriceKzt * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.comment ? (
                    <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                      {order.comment}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Заказ записывается в момент отправки в WhatsApp. Номер из карточки
        совпадает с номером в сообщении покупателя. Суммы считает сервер по
        каталогу, а не браузер.
      </p>
    </div>
  );
}
