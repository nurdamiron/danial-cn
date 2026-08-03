"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { saveProfile } from "@/store/profile";

type Mode = "login" | "register";

export function CustomerAuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name, phone };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("error"));
        return;
      }

      // Sync local profile for cart prefills
      if (data.user) {
        saveProfile({
          name: data.user.name ?? "",
          phone: data.user.phone ?? "",
          city: "",
        });
      }

      const role = data.user?.role;
      if (role === "ADMIN") {
        window.location.href = "/admin";
        return;
      }
      router.push("/profile");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="t-display t-h3 text-center">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </h1>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {mode === "register" ? (
          <>
            <label className="block">
              <span className="field-label">{t("name")}</span>
              <input
                required
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="field-label">{t("phone")}</span>
              <input
                className="field"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 7__ ___ __ __"
                autoComplete="tel"
              />
            </label>
          </>
        ) : null}

        <label className="block">
          <span className="field-label">{t("email")}</span>
          <input
            type="email"
            required
            className="field"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="field-label">{t("password")}</span>
          <input
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          {mode === "register" ? (
            <span className="t-micro mt-1.5 block text-muted">
              {t("passwordHint")}
            </span>
          ) : null}
        </label>

        {error ? (
          <p
            role="alert"
            className="alert-error"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-12 w-full text-sm"
        >
          {loading ? "…" : mode === "login" ? t("loginBtn") : t("registerBtn")}
        </button>
      </form>

      <p className="mt-6 text-center text-[0.8125rem] text-muted">
        {mode === "login" ? (
          <>
            {t("noAccount")}{" "}
            <Link href="/register" className="text-ink underline-offset-4 hover:underline">
              {t("toRegister")}
            </Link>
          </>
        ) : (
          <>
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-ink underline-offset-4 hover:underline">
              {t("toLogin")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
