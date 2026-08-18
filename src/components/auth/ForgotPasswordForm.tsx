"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ForgotPasswordForm({ whatsappUrl }: { whatsappUrl: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      setMessage(data.message ?? t("error"));
    } catch {
      setMessage(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="t-display t-h3 text-center">{t("forgotTitle")}</h1>
      <p className="mt-3 text-center text-sm text-muted">{t("forgotHint")}</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="field-label">{t("email")}</span>
          <input
            type="email"
            required
            className="field"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {message ? (
          <p role="status" className="border border-line bg-stone px-3 py-2 text-sm">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-12 w-full text-sm"
        >
          {loading ? "…" : t("forgotBtn")}
        </button>
      </form>

      <p className="mt-6 text-center text-[0.8125rem] text-muted">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="text-ink underline-offset-4 hover:underline"
        >
          {t("forgotWhatsapp")}
        </a>
      </p>
      <p className="mt-2 text-center text-[0.8125rem] text-muted">
        <Link href="/login" className="text-ink underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
