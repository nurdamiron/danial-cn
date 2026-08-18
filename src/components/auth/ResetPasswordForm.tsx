"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { saveProfile } from "@/store/profile";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("error"));
        return;
      }
      if (data.user) {
        saveProfile({
          name: data.user.name ?? "",
          phone: data.user.phone ?? "",
          city: "",
        });
      }
      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin";
        return;
      }
      router.push("/profile");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="card p-6 text-center sm:p-8">
        <h1 className="t-display t-h3">{t("resetTitle")}</h1>
        <p className="mt-3 text-sm text-muted">{t("resetNoToken")}</p>
        <Link
          href="/forgot"
          className="mt-6 inline-block text-sm text-ink underline underline-offset-4"
        >
          {t("forgotTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="t-display t-h3 text-center">{t("resetTitle")}</h1>
      <p className="mt-3 text-center text-sm text-muted">{t("resetHint")}</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="field-label">{t("newPassword")}</span>
          <input
            type="password"
            required
            minLength={8}
            className="field"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="t-micro mt-1.5 block text-muted">
            {t("passwordHint")}
          </span>
        </label>

        {error ? (
          <p role="alert" className="alert-error">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-12 w-full text-sm"
        >
          {loading ? "…" : t("resetBtn")}
        </button>
      </form>
    </div>
  );
}
