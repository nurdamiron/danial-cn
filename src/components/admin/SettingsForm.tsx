"use client";

import { useState } from "react";
import { Notice } from "@/components/admin/ui/AdminSection";

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

/**
 * The words the storefront says, in both languages.
 *
 * Laid out in pairs on purpose: every line here is shown to a Russian
 * speaker or a Kazakh one, and editing one of a pair without the other is
 * the mistake this screen exists to make hard to miss.
 */
export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    // A stale "saved" under a form the owner has since edited is a small lie.
    setOk("");
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
      setOk("Сохранено. На сайте появится через несколько секунд.");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof SettingsInput,
    opts?: { textarea?: boolean },
  ) => (
    <label className="block">
      <span className="field-label">{label}</span>
      {opts?.textarea ? (
        <textarea
          className="field"
          rows={2}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      ) : (
        <input
          className="field"
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </label>
  );

  /** A pair of languages saying the same thing. */
  const pair = (title: string, ru: keyof SettingsInput, kk: keyof SettingsInput) => (
    <div className="sm:col-span-2">
      <p className="t-label mb-2 text-muted">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Русский", ru, { textarea: true })}
        {field("Қазақша", kk, { textarea: true })}
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="card max-w-3xl space-y-7 p-5 sm:p-7">
      <label className="block max-w-xs">
        <span className="field-label">WhatsApp, только цифры</span>
        <input
          className="field tabular"
          inputMode="numeric"
          placeholder="77066316449"
          value={form.whatsappE164}
          onChange={(e) => set("whatsappE164", e.target.value)}
        />
      </label>

      <div className="grid gap-6 border-t border-line pt-6">
        {pair("Карго", "deliveryCargoRu", "deliveryCargoKk")}
        {pair("Авиа", "deliveryAviaRu", "deliveryAviaKk")}
        {pair("Экспресс", "deliveryExpressRu", "deliveryExpressKk")}
      </div>

      <div className="grid gap-6 border-t border-line pt-6">
        {pair("Оплата Kaspi", "kaspiNoteRu", "kaspiNoteKk")}
        {pair("Предупреждение о репликах", "disclaimerRu", "disclaimerKk")}
      </div>

      <Notice>{error}</Notice>
      {ok ? <Notice tone="quiet">{ok}</Notice> : null}

      <div className="border-t border-line pt-6">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary h-12 w-full px-8 text-sm sm:w-auto"
        >
          {saving ? "…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
