"use client";

import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { Notice } from "@/components/admin/ui/AdminSection";

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
      className="card max-w-lg space-y-6 p-5 sm:p-7"
    >
      {/* Identity is stated, not editable: the address is the account. */}
      <dl className="space-y-1 border-b border-line pb-5">
        <div className="flex gap-2">
          <dt className="t-label w-24 shrink-0 pt-0.5 text-muted">Почта</dt>
          <dd className="text-sm break-all">{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="t-label w-24 shrink-0 pt-0.5 text-muted">Роль</dt>
          <dd className="text-sm">
            {user.role === "ADMIN" ? "Администратор" : "Покупатель"}
          </dd>
        </div>
      </dl>

      <label className="block">
        <span className="field-label">Имя</span>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="field-label">Телефон</span>
        <input
          className="field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <div className="border-t border-line pt-6">
        <p className="t-label mb-3 text-muted">Смена пароля</p>
        <label className="mb-4 block">
          <span className="field-label">Текущий пароль</span>
          <input
            type="password"
            className="field"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className="block">
          <span className="field-label">Новый пароль, минимум 8 символов</span>
          <input
            type="password"
            minLength={8}
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
      </div>

      <Notice>{error}</Notice>
      {message ? <Notice tone="quiet">{message}</Notice> : null}

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary h-12 w-full px-8 text-sm sm:w-auto"
      >
        {saving ? "Сохранение…" : "Сохранить"}
      </button>
    </form>
  );
}
