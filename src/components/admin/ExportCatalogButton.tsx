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
        `Экспорт: ${data.products} товаров + settings. npm run export:static · commit · deploy`,
      );
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
        className="h-11 w-full border border-ink px-6 text-sm disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Экспорт…" : "Export → static (Vercel)"}
      </button>
      {msg ? <p className="text-xs text-green-700">{msg}</p> : null}
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
