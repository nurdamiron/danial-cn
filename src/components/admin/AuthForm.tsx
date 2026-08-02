"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="border border-line bg-paper p-6 sm:p-8">
      <h1 className="mb-2 text-center text-xs tracking-[0.3em] uppercase">
        Danial CN
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        {mode === "login" ? "Вход в админку / кабинет" : "Регистрация"}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" ? (
          <>
            <label className="block text-xs">
              Имя
              <input
                required
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="block text-xs">
              Телефон
              <input
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 …"
                autoComplete="tel"
              />
            </label>
          </>
        ) : null}

        <label className="block text-xs">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block text-xs">
          Пароль
          <input
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          {mode === "register" ? (
            <span className="mt-1 block text-[11px] text-muted">
              Минимум 8 символов
            </span>
          ) : null}
        </label>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-ink text-sm text-paper disabled:opacity-50"
        >
          {loading
            ? "…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/admin/register" className="text-ink underline">
              Регистрация
            </Link>
            <br />
            <a href="/ru/login" className="mt-2 inline-block text-ink underline">
              Личный кабинет на сайте →
            </a>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/admin/login" className="text-ink underline">
              Войти
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
