"use client";

import { useState } from "react";

export function ExportCatalogButton() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onExport() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/export", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Ошибка экспорта");
        return;
      }
      setMsg(
        `Готово: ${data.products} товаров. Отправьте изменения, чтобы они появились на сайте.`,
      );
    } catch {
      // A dropped connection or a non-JSON 500 used to end here with no
      // word to the user: the button came back and nothing was saved.
      setErr("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={onExport}
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 border border-ink px-6 text-sm disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Готовим…" : "Подготовить каталог для сайта"}
      </button>
      {msg ? <p className="text-[0.8125rem] text-muted">{msg}</p> : null}
      {err ? <p className="text-danger text-[0.8125rem]">{err}</p> : null}
    </div>
  );
}
