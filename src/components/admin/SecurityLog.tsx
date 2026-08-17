"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatMoment } from "@/lib/datetime";

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

  const load = useCallback(async (failures: boolean) => {
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
  }, [initialStats]);

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

  const cards = [
    { label: "Успешных входов за сутки", value: stats.ok24h },
    { label: "Неудачных попыток за сутки", value: stats.failed24h },
    { label: "Регистраций за сутки", value: stats.registered24h },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="border border-line bg-paper p-4">
            <div className="text-2xl font-light">{c.value}</div>
            <div className="mt-1 text-xs text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={onlyFailures}
            onChange={(e) => setOnlyFailures(e.target.checked)}
          />
          Только неудачные
        </label>
        <button
          type="button"
          className="border border-line px-3 py-1.5 text-xs disabled:opacity-50"
          disabled={loading}
          onClick={() => void load(onlyFailures)}
        >
          {loading ? "…" : "Обновить"}
        </button>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted">
            <tr>
              <th className="p-3">Когда</th>
              <th className="p-3">Событие</th>
              <th className="p-3">Почта</th>
              <th className="p-3">Адрес</th>
              <th className="p-3">Результат</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id} className="border-b border-line">
                <td className="p-3 text-xs whitespace-nowrap text-muted">
                  {formatMoment(a.createdAt)}
                </td>
                <td className="p-3 text-xs">
                  {a.action === "register" ? "регистрация" : "вход"}
                </td>
                <td className="p-3 text-xs break-all">{a.email}</td>
                <td className="p-3 text-xs text-muted">{a.ip || "неизвестен"}</td>
                <td className="p-3 text-xs">
                  <span className={a.success ? "" : "text-red-600"}>
                    {REASON_LABEL[a.reason] ?? a.reason}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attempts.length === 0 ? (
        <p className="text-xs text-muted">Записей пока нет.</p>
      ) : null}

      <p className="text-xs text-muted">
        Показаны последние 100 событий. Записи старше 30 дней удаляются
        автоматически. После 8 неудачных попыток с одного адреса вход по этой
        почте закрывается для него на 15 минут, а сам адрес блокируется целиком
        после 25 промахов по любым аккаунтам.
      </p>
    </div>
  );
}
