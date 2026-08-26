"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLinkIcon } from "@/components/ui/icons";
import { Notice } from "@/components/admin/ui/AdminSection";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
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
        setError(data.error ?? "Ошибка");
        return;
      }

      const role = data.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        // Store customers go to personal cabinet on the site
        window.location.href = "/ru/profile";
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="t-label mb-2 text-center tracking-[0.3em]">
        Danial CN
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        {mode === "login" ? "Вход в админку / кабинет" : "Регистрация"}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" ? (
          <>
            <label className="block">
              Имя
              <input
                required
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block">
              Телефон
              <input
                className="field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 …"
                autoComplete="tel"
              />
            </label>
          </>
        ) : null}

        <label className="block">
          Email
          <input
            type="email"
            required
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block">
          Пароль
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
            <span className="mt-1.5 block text-[0.8125rem] text-muted">
              Минимум 8 символов
            </span>
          ) : null}
        </label>

        <Notice>{error}</Notice>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-12 w-full text-sm"
        >
          {loading
            ? "…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-6 text-center text-[0.8125rem] text-muted">
        {mode === "login" ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/admin/register" className="link-quiet text-ink">
              Регистрация
            </Link>
            <br />
            <a
              href="/ru/login"
              className="link-quiet mt-2 inline-flex items-center gap-1 text-ink"
            >
              Личный кабинет на сайте
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/admin/login" className="link-quiet text-ink">
              Войти
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
