"use client";

import { useState } from "react";
import type { SessionUser } from "@/lib/auth";

export function ProfileForm({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, string> = { name, phone };
      if (password) {
        body.password = password;
        body.currentPassword = currentPassword;
      }
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      setPassword("");
      setCurrentPassword("");
      setMessage("Сохранено");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg space-y-4 border border-line bg-paper p-4 sm:p-6"
    >
      <div className="text-xs text-muted">
        Email: <span className="text-ink">{user.email}</span>
        <br />
        Роль:{" "}
        <span className="text-ink">
          {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
        </span>
      </div>

      <label className="block text-xs">
        Имя
        <input
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="block text-xs">
        Телефон
        <input
          className="mt-1 w-full border border-line px-3 py-2.5 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <div className="border-t border-line pt-4">
        <p className="mb-3 text-xs tracking-wide text-muted uppercase">
          Смена пароля
        </p>
        <label className="mb-3 block text-xs">
          Текущий пароль
          <input
            type="password"
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className="block text-xs">
          Новый пароль
          <input
            type="password"
            minLength={8}
            className="mt-1 w-full border border-line px-3 py-2.5 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {message ? <p className="text-xs text-green-700">{message}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="h-11 w-full bg-ink text-sm text-paper disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {saving ? "Сохранение…" : "Сохранить"}
      </button>
    </form>
  );
}
