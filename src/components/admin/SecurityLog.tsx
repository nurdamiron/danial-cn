"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatMoment } from "@/lib/datetime";
import { EmptyState } from "@/components/admin/ui/AdminSection";

export type Attempt = {
  id: string;
  action: string;
  email: string;
  ip: string;
  success: boolean;
  reason: string;
  createdAt: string;
};

export type SecurityStats = {
  failed24h: number;
  ok24h: number;
  registered24h: number;
};

const REASON_LABEL: Record<string, string> = {
  ok: "успешно",
  no_user: "такой почты нет",
  bad_password: "неверный пароль",
  blocked: "аккаунт заблокирован",
  rate_limited: "отклонено, слишком много попыток",
};

/** Enough misses in a day that somebody is trying doors rather than mistyping. */
const SUSPICIOUS_FAILURES = 8;

/**
 * Who has been knocking.
 *
 * The three figures at the top are not equal: successful sign-ins and new
 * accounts are the shop's ordinary day, and only the failures can turn into a
 * question. So only that one changes colour, and only once there are enough
 * of them to mean something — a red number that is always red teaches the
 * owner to stop reading it.
 */
export function SecurityLog({
  attempts: initialAttempts,
  stats: initialStats,
}: {
  attempts: Attempt[];
  stats: SecurityStats;
}) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const [stats, setStats] = useState(initialStats);
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (failures: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/security${failures ? "?failures=1" : ""}`,
        );
        const data = await res.json();
        if (res.ok) {
          setAttempts(data.attempts ?? []);
          setStats(data.stats ?? initialStats);
        }
      } finally {
        setLoading(false);
      }
    },
    [initialStats],
  );

  // The server already rendered the unfiltered list, so the first pass has
  // nothing to fetch. Every later change of the filter does.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void load(onlyFailures);
  }, [onlyFailures, load]);

  const alarming = stats.failed24h >= SUSPICIOUS_FAILURES;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Входов за сутки", value: stats.ok24h, alarm: false },
          { label: "Неудачных попыток", value: stats.failed24h, alarm: alarming },
          { label: "Регистраций", value: stats.registered24h, alarm: false },
        ].map((c) => (
          <div key={c.label} className="border-t border-line pt-3">
            <p className="t-label text-muted">{c.label}</p>
            <p
              className={`t-display mt-1 text-3xl ${c.alarm ? "text-danger" : ""}`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex min-h-11 items-center gap-2 text-[0.8125rem] md:min-h-0">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ink md:h-auto md:w-auto"
            checked={onlyFailures}
            onChange={(e) => setOnlyFailures(e.target.checked)}
          />
          Только неудачные
        </label>
        <button
          type="button"
          className="btn btn-outline h-11 px-4 text-[0.8125rem] md:h-9"
          disabled={loading}
          onClick={() => void load(onlyFailures)}
        >
          {loading ? "…" : "Обновить"}
        </button>
      </div>

      {attempts.length === 0 ? (
        <EmptyState>Записей пока нет.</EmptyState>
      ) : (
        <>
        {/* Rows rather than a sideways-scrolling table on a phone. */}
        <ul className="divide-y divide-line border-y border-line md:hidden">
          {attempts.map((a) => (
            <li key={a.id} className="py-3">
              <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                <span className={a.success ? "" : "text-danger"}>
                  {REASON_LABEL[a.reason] ?? a.reason}
                </span>
                <span className="t-data shrink-0 text-muted">
                  {formatMoment(a.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-[0.8125rem] break-all">
                {a.action === "register" ? "Регистрация" : "Вход"}: {a.email}
              </p>
              <p className="t-data mt-0.5 text-muted">
                {a.ip || "адрес неизвестен"}
              </p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong">
                {["Когда", "Событие", "Почта", "Адрес", "Результат"].map((h) => (
                  <th key={h} className="t-label pb-2 font-medium text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="t-data py-2.5 pr-3 whitespace-nowrap text-muted">
                    {formatMoment(a.createdAt)}
                  </td>
                  <td className="py-2.5 pr-3 text-[0.8125rem]">
                    {a.action === "register" ? "регистрация" : "вход"}
                  </td>
                  <td className="py-2.5 pr-3 text-[0.8125rem] break-all">
                    {a.email}
                  </td>
                  <td className="t-data py-2.5 pr-3 text-muted">
                    {a.ip || "неизвестен"}
                  </td>
                  <td
                    className={`py-2.5 text-[0.8125rem] ${a.success ? "" : "text-danger"}`}
                  >
                    {REASON_LABEL[a.reason] ?? a.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <p className="text-[0.8125rem] text-muted">
        Показаны последние 100 событий. Записи старше 30 дней удаляются
        автоматически. После 8 неудачных попыток с одного адреса вход по этой
        почте закрывается для него на 15 минут, а сам адрес блокируется целиком
        после 25 промахов по любым аккаунтам.
      </p>
    </div>
  );
}
