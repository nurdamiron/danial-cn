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
    <div className="border border-line bg-paper p-6 sm:p-8">
      <h1 className="mb-2 text-center text-xs tracking-[0.3em] uppercase">
        Danial CN
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" ? (
          <>
            <label className="block text-xs text-muted">
              {t("name")}
              <input
                required
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block text-xs text-muted">
              {t("phone")}
              <input
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 …"
                autoComplete="tel"
              />
            </label>
          </>
        ) : null}

        <label className="block text-xs text-muted">
          {t("email")}
          <input
            type="email"
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block text-xs text-muted">
          {t("password")}
          <input
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          {mode === "register" ? (
            <span className="mt-1 block text-[11px] text-muted">
              {t("passwordHint")}
            </span>
          ) : null}
        </label>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-ink text-sm text-paper disabled:opacity-50"
        >
          {loading ? "…" : mode === "login" ? t("loginBtn") : t("registerBtn")}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            {t("noAccount")}{" "}
            <Link href="/register" className="text-ink underline">
              {t("toRegister")}
            </Link>
          </>
        ) : (
          <>
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-ink underline">
              {t("toLogin")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
