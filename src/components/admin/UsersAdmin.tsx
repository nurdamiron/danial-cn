"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminUser } from "@/lib/admin-users";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatMoment } from "@/lib/datetime";
import { Notice } from "@/components/admin/ui/AdminSection";

export type AdminUserRow = AdminUser;

const emptyCreate = {
  email: "",
  password: "",
  name: "",
  phone: "",
  role: "USER" as "USER" | "ADMIN",
};

type Patch = {
  name?: string;
  phone?: string;
  password?: string;
  role?: "USER" | "ADMIN";
  blocked?: boolean;
  signOutEverywhere?: boolean;
};

export function UsersAdmin({
  users: initial,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [resetLink, setResetLink] = useState<{ email: string; url: string } | null>(
    null,
  );

  // The list is capped server side, so filtering has to happen in the query,
  // not in the browser — otherwise search silently misses anyone past the cap.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/admin/users?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        if (res.ok) setUsers(data.users ?? []);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const counts = useMemo(
    () => ({
      total: users.length,
      blocked: users.filter((u) => u.blockedAt).length,
    }),
    [users],
  );

  function applyUser(updated: AdminUserRow) {
    setUsers((list) =>
      list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  }

  async function patchUser(id: string, body: Patch, note: string) {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return false;
      }
      if (body.role === "ADMIN") {
        setUsers((list) =>
          list.map((u) =>
            u.role === "ADMIN" && u.id !== id ? { ...u, role: "USER" } : u,
          ),
        );
      }
      applyUser(data.user);
      setMessage(note);
      router.refresh();
      return true;
    } finally {
      setBusyId(null);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка создания");
        return;
      }
      if (createForm.role === "ADMIN") {
        setUsers((list) =>
          list
            .map((u) => (u.role === "ADMIN" ? { ...u, role: "USER" } : u))
            .concat(data.user),
        );
      } else {
        setUsers((list) => [data.user, ...list]);
      }
      setCreateForm(emptyCreate);
      setMessage(`Создан: ${data.user.email}`);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  function startEdit(u: AdminUserRow) {
    setEditId(u.id);
    setEditForm({ name: u.name, phone: u.phone ?? "", password: "" });
    setError("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    const body: Patch = { name: editForm.name, phone: editForm.phone };
    if (editForm.password) body.password = editForm.password;
    const ok = await patchUser(
      editId,
      body,
      editForm.password
        ? "Пароль изменён, все сеансы этого пользователя закрыты"
        : "Пользователь обновлён",
    );
    if (ok) setEditId(null);
  }

  async function setRole(id: string, role: "USER" | "ADMIN") {
    if (role === "ADMIN") {
      const ok = confirm(
        "Назначить единственным admin? Текущий admin станет USER.",
      );
      if (!ok) return;
    }
    await patchUser(id, { role }, `Роль изменена на ${role}`);
  }

  async function toggleBlock(u: AdminUserRow) {
    const blocking = !u.blockedAt;
    if (blocking && !confirm(`Заблокировать ${u.email}?`)) return;
    await patchUser(
      u.id,
      { blocked: blocking },
      blocking
        ? "Аккаунт заблокирован, вход закрыт"
        : "Блокировка снята",
    );
  }

  async function signOutEverywhere(u: AdminUserRow) {
    if (!confirm(`Закрыть все сеансы ${u.email}?`)) return;
    await patchUser(u.id, { signOutEverywhere: true }, "Все сеансы закрыты");
  }

  async function makeResetLink(u: AdminUserRow) {
    setBusyId(u.id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${u.id}/reset-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setResetLink({ email: data.email, url: data.url });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить пользователя?")) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setUsers((list) => list.filter((u) => u.id !== id));
      setMessage("Пользователь удалён");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function Actions({ u }: { u: AdminUserRow }) {
    const self = u.id === currentUserId;
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem]">
        <button type="button" className="underline" onClick={() => startEdit(u)}>
          Изменить
        </button>
        {u.role === "USER" ? (
          <button
            type="button"
            disabled={busyId === u.id}
            className="underline disabled:opacity-50"
            onClick={() => setRole(u.id, "ADMIN")}
          >
            <span className="inline-flex items-center gap-1">
              <ArrowRightIcon className="h-3.5 w-3.5" />
              admin
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled={busyId === u.id || self}
            className="underline disabled:opacity-50"
            onClick={() => setRole(u.id, "USER")}
          >
            <span className="inline-flex items-center gap-1">
              <ArrowRightIcon className="h-3.5 w-3.5" />
              user
            </span>
          </button>
        )}
        <button
          type="button"
          disabled={busyId === u.id || self}
          className="underline disabled:opacity-50"
          onClick={() => toggleBlock(u)}
        >
          {u.blockedAt ? "Разблокировать" : "Заблокировать"}
        </button>
        <button
          type="button"
          disabled={busyId === u.id}
          className="underline disabled:opacity-50"
          onClick={() => signOutEverywhere(u)}
        >
          Закрыть сеансы
        </button>
        <button
          type="button"
          disabled={busyId === u.id}
          className="underline disabled:opacity-50"
          onClick={() => makeResetLink(u)}
        >
          Ссылка на сброс
        </button>
        {self ? (
          <span className="text-muted">это вы</span>
        ) : (
          <button
            type="button"
            disabled={busyId === u.id}
            className="text-danger underline-offset-4 hover:underline disabled:opacity-50"
            onClick={() => remove(u.id)}
          >
            Удалить
          </button>
        )}
      </div>
    );
  }

  function EditFields() {
    return (
      <div className="space-y-2">
        <input
          className="field px-2.5 py-1.5 text-[0.8125rem]"
          value={editForm.name}
          onChange={(e) =>
            setEditForm((f) => ({ ...f, name: e.target.value }))
          }
          placeholder="Имя"
        />
        <input
          className="field px-2.5 py-1.5 text-[0.8125rem]"
          value={editForm.phone}
          onChange={(e) =>
            setEditForm((f) => ({ ...f, phone: e.target.value }))
          }
          placeholder="Телефон"
        />
        <input
          type="password"
          autoComplete="new-password"
          className="field px-2.5 py-1.5 text-[0.8125rem]"
          value={editForm.password}
          onChange={(e) =>
            setEditForm((f) => ({ ...f, password: e.target.value }))
          }
          placeholder="Новый пароль, необязательно"
        />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary h-10 px-5 text-[0.8125rem]">
            Сохранить
          </button>
          <button
            type="button"
            className="btn btn-outline h-10 px-5 text-[0.8125rem]"
            onClick={() => setEditId(null)}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <Notice>{error}</Notice>
      ) : null}
      {message ? (
        <Notice tone="quiet">{message}</Notice>
      ) : null}

      {resetLink ? (
        <div className="border border-ink bg-paper p-4">
          <p className="t-label text-muted">
            Ссылка для {resetLink.email}
          </p>
          <p className="mt-2 text-[0.8125rem] break-all">{resetLink.url}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.8125rem]">
            <button
              type="button"
              className="bg-ink px-3 py-1.5 text-paper"
              onClick={() => {
                void navigator.clipboard?.writeText(resetLink.url);
                setMessage("Ссылка скопирована");
              }}
            >
              Скопировать
            </button>
            <button
              type="button"
              className="underline"
              onClick={() => setResetLink(null)}
            >
              Скрыть
            </button>
            <span className="text-muted">
              Действует час, срабатывает один раз. Отправьте её в WhatsApp.
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="field sm:max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, почте или телефону"
        />
        <p className="text-[0.8125rem] text-muted">
          {searching
            ? "Ищу…"
            : `Найдено ${counts.total}${
                counts.blocked ? `, из них заблокировано ${counts.blocked}` : ""
              }`}
        </p>
      </div>

      <form
        onSubmit={createUser}
        className="card grid gap-4 p-5 sm:grid-cols-2"
      >
        <div className="t-label text-muted sm:col-span-2">
          Новый пользователь
        </div>
        <label className="block">
          Почта
          <input
            type="email"
            required
            className="field"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </label>
        <label className="block">
          Пароль, минимум 8 символов
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="field"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </label>
        <label className="block">
          Имя
          <input
            required
            className="field"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </label>
        <label className="block">
          Телефон
          <input
            className="field"
            value={createForm.phone}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, phone: e.target.value }))
            }
          />
        </label>
        <label className="block">
          Роль
          <select
            className="field"
            value={createForm.role}
            onChange={(e) =>
              setCreateForm((f) => ({
                ...f,
                role: e.target.value as "USER" | "ADMIN",
              }))
            }
          >
            <option value="USER">Покупатель</option>
            <option value="ADMIN">Администратор, только один</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={creating}
            className="h-10 w-full bg-ink text-sm text-paper disabled:opacity-50"
          >
            {creating ? "…" : "Создать"}
          </button>
        </div>
      </form>

      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-[0.8125rem] break-all text-muted">{u.email}</div>
                {u.phone ? (
                  <div className="text-[0.8125rem] text-muted">{u.phone}</div>
                ) : null}
                <div className="t-data mt-1 text-muted">
                  Вход {formatMoment(u.lastLoginAt) || "ни разу"}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`tag ${
                    u.role === "ADMIN"
                      ? "border-ink bg-ink text-paper"
                      : "border border-line text-muted"
                  }`}
                >
                  {u.role}
                </span>
                {u.blockedAt ? (
                  <span className="tag border-danger/30 bg-[var(--danger-tint)] text-danger">
                    Блок
                  </span>
                ) : null}
              </div>
            </div>

            {editId === u.id ? (
              <form
                onSubmit={saveEdit}
                className="mt-3 border-t border-line pt-3"
              >
                <EditFields />
              </form>
            ) : (
              <div className="mt-3">
                <Actions u={u} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-[0.8125rem] tracking-wide text-muted">
            <tr>
              <th className="p-3">Имя</th>
              <th className="p-3">Почта</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Последний вход</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line align-top">
                {editId === u.id ? (
                  <td className="p-3" colSpan={6}>
                    <form onSubmit={saveEdit} className="max-w-sm">
                      <EditFields />
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-[0.8125rem]">{u.email}</td>
                    <td className="p-3 text-[0.8125rem]">{u.phone || "нет"}</td>
                    <td className="p-3 text-[0.8125rem]">
                      <span className="uppercase">{u.role}</span>
                      {u.blockedAt ? (
                        <span className="ml-2 text-danger">заблокирован</span>
                      ) : null}
                    </td>
                    <td className="p-3 text-[0.8125rem] text-muted">
                      {formatMoment(u.lastLoginAt) || "ни разу"}
                    </td>
                    <td className="p-3">
                      <Actions u={u} />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 ? (
        <p className="text-[0.8125rem] text-muted">Никого не нашлось.</p>
      ) : null}

      <p className="text-[0.8125rem] text-muted">
        Блокировка закрывает вход, но сохраняет аккаунт и историю. Смена пароля
        и блокировка закрывают все открытые сеансы этого человека сразу.
      </p>
    </div>
  );
}
