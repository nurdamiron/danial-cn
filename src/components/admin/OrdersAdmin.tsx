"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoment } from "@/lib/datetime";
import { formatKzt } from "@/lib/money";
import { DELIVERY_LABEL, type AdminOrder } from "@/lib/admin-orders";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orders";
import { EmptyState, Notice } from "@/components/admin/ui/AdminSection";
import { StatusTag } from "@/components/admin/ui/StatusTag";

/**
 * Digits for tel: and wa.me. Kazakh numbers typed with the trunk 8 are
 * rewritten to the country code, which is the only form WhatsApp accepts.
 */
function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("8")
    ? `7${digits.slice(1)}`
    : digits;
}

/**
 * The screen the shop opens every morning.
 *
 * Ordered around one question — what still needs an answer — so a new order
 * is legible from across the room and a finished one gets out of the way. The
 * status control sits on the row rather than behind a click: moving an order
 * along is the whole job of this page, and a select that needs the card
 * opened first would put a step in front of the only step that matters.
 */
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
    <div className="space-y-6">
      <Notice>{error}</Notice>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="field sm:max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Номер, имя, телефон или город"
          aria-label="Поиск по заказам"
        />
        <select
          className="field sm:w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Фильтр по статусу"
        >
          <option value="">Все статусы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <p className="t-data shrink-0 text-muted" aria-live="polite">
          {loading ? "Ищу…" : `Заказов: ${orders.length}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState>
          {query || status
            ? "Под фильтр ничего не подходит."
            : "Заказов пока нет."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((order) => {
            const open = openId === order.id;
            return (
              <li
                key={order.id}
                /* A new order is the only kind that owes the shop something,
                   so it gets the one piece of emphasis on the list. */
                className={
                  order.status === "new" ? "border-l-2 border-l-ink pl-3" : "pl-3"
                }
              >
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="t-data text-muted">{order.number}</span>
                      <StatusTag status={order.status} />
                      {order.source === "quick" ? (
                        <span className="tag">быстрый заказ</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm">
                      {order.customerName}
                      {order.customerPhone ? `, ${order.customerPhone}` : ""}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">
                      {order.city},{" "}
                      {DELIVERY_LABEL[order.delivery] ?? order.delivery}
                      {" · "}
                      {formatMoment(order.createdAt)}
                      {order.user ? ` · ${order.user.email}` : " · гость"}
                    </p>
                    {/* Answering the buyer is the next step for every new
                        order; the number used to be text to copy by hand. */}
                    {phoneDigits(order.customerPhone ?? "").length >= 10 ? (
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`tel:+${phoneDigits(order.customerPhone)}`}
                          className="btn btn-outline h-11 px-4 text-[0.8125rem] sm:h-9"
                        >
                          Позвонить
                        </a>
                        <a
                          href={`https://wa.me/${phoneDigits(order.customerPhone)}?text=${encodeURIComponent(`Здравствуйте, это Danial CN, пишу по заказу ${order.number}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline h-11 px-4 text-[0.8125rem] sm:h-9"
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <p className="t-price tabular text-xl">
                      {formatKzt(order.totalKzt)}
                    </p>
                    <select
                      className="field h-11 w-auto px-3 py-0 text-[0.8125rem] sm:h-auto sm:px-2.5 sm:py-1.5"
                      value={order.status}
                      disabled={busyId === order.id}
                      aria-label={`Статус заказа ${order.number}`}
                      onChange={(e) =>
                        void setOrderStatus(
                          order.id,
                          e.target.value as OrderStatus,
                        )
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
                      className="link-quiet -my-1 py-2.5 text-[0.8125rem] sm:my-0 sm:py-0"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : order.id)}
                    >
                      {open ? "Свернуть" : `Состав, ${order.items.length}`}
                    </button>
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-line py-3">
                    <ul className="space-y-2">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between gap-3 text-[0.8125rem]"
                        >
                          <span>
                            {item.brand} {item.name}
                            {item.colorLabel ? `, ${item.colorLabel}` : ""}
                            {item.sizeLabel ? `, ${item.sizeLabel}` : ""}
                            {item.qty > 1 ? ` × ${item.qty}` : ""}
                          </span>
                          <span className="tabular shrink-0 text-muted">
                            {formatKzt(item.unitPriceKzt * item.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {order.comment ? (
                      <p className="mt-3 border-t border-line pt-3 text-[0.8125rem] text-muted">
                        {order.comment}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[0.8125rem] text-muted">
        Заказ записывается в момент отправки в WhatsApp. Номер из карточки
        совпадает с номером в сообщении покупателя. Суммы считает сервер по
        каталогу, а не браузер.
      </p>
    </div>
  );
}
