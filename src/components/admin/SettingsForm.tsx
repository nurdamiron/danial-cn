"use client";

import { useState } from "react";

export type SettingsInput = {
  whatsappE164: string;
  deliveryCargoRu: string;
  deliveryCargoKk: string;
  deliveryAviaRu: string;
  deliveryAviaKk: string;
  deliveryExpressRu: string;
  deliveryExpressKk: string;
  kaspiNoteRu: string;
  kaspiNoteKk: string;
  disclaimerRu: string;
  disclaimerKk: string;
};

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setForm(data.settings);
      setOk("Настройки сохранены");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof SettingsInput,
    opts?: { textarea?: boolean },
  ) => (
    <label className="block text-xs">
      {label}
      {opts?.textarea ? (
        <textarea
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          rows={2}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full border border-line px-3 py-2 text-sm"
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-4 border border-line bg-paper p-4 sm:grid-cols-2 sm:p-6"
    >
      <div className="sm:col-span-2 text-xs tracking-wide text-muted uppercase">
        Update — настройки сайта (Read + Update)
      </div>

      {field("WhatsApp (цифры, 7706…)", "whatsappE164")}

      <div className="sm:col-span-2 border-t border-line pt-3 text-xs text-muted">
        Доставка
      </div>
      {field("Карго RU", "deliveryCargoRu", { textarea: true })}
      {field("Карго KK", "deliveryCargoKk", { textarea: true })}
      {field("Авиа RU", "deliveryAviaRu", { textarea: true })}
      {field("Авиа KK", "deliveryAviaKk", { textarea: true })}
      {field("Экспресс RU", "deliveryExpressRu", { textarea: true })}
      {field("Экспресс KK", "deliveryExpressKk", { textarea: true })}

      <div className="sm:col-span-2 border-t border-line pt-3 text-xs text-muted">
        Kaspi / дисклеймер
      </div>
      {field("Kaspi RU", "kaspiNoteRu", { textarea: true })}
      {field("Kaspi KK", "kaspiNoteKk", { textarea: true })}
      {field("Disclaimer RU", "disclaimerRu", { textarea: true })}
      {field("Disclaimer KK", "disclaimerKk", { textarea: true })}

      {error ? (
        <p className="text-xs text-red-600 sm:col-span-2">{error}</p>
      ) : null}
      {ok ? (
        <p className="text-xs text-green-700 sm:col-span-2">{ok}</p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="h-11 w-full bg-ink text-sm text-paper disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {saving ? "…" : "Сохранить настройки"}
        </button>
      </div>
    </form>
  );
}
