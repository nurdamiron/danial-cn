"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string | Date;
};

const emptyCreate = {
  email: "",
  password: "",
  name: "",
  phone: "",
  role: "USER" as "USER" | "ADMIN",
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
            .map((u) =>
              u.role === "ADMIN" ? { ...u, role: "USER" } : u,
            )
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
    setBusyId(editId);
    setError("");
    try {
      const body: Record<string, string> = {
        name: editForm.name,
        phone: editForm.phone,
      };
      if (editForm.password) body.password = editForm.password;
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setUsers((list) =>
        list.map((u) => (u.id === editId ? { ...u, ...data.user } : u)),
      );
      setEditId(null);
      setMessage("Пользователь обновлён");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function setRole(id: string, role: "USER" | "ADMIN") {
    if (role === "ADMIN") {
      const ok = confirm(
        "Назначить единственным admin? Текущий admin станет USER.",
      );
      if (!ok) return;
    }
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка");
        return;
      }
      setUsers((list) =>
        list.map((u) => {
          if (role === "ADMIN" && u.role === "ADMIN" && u.id !== id) {
            return { ...u, role: "USER" };
          }
          if (u.id === id) return { ...u, role: data.user.role };
          return u;
        }),
      );
      router.refresh();
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
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="border border-line bg-stone px-3 py-2 text-xs">{message}</p>
      ) : null}

      {/* CREATE */}
      <form
        onSubmit={createUser}
        className="grid gap-3 border border-line bg-paper p-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2 text-xs tracking-wide text-muted uppercase">
          Create — новый пользователь
        </div>
        <label className="block text-xs">
          Email *
          <input
            type="email"
            required
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </label>
        <label className="block text-xs">
          Пароль * (мин. 8)
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </label>
        <label className="block text-xs">
          Имя *
          <input
            required
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </label>
        <label className="block text-xs">
          Телефон
          <input
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            value={createForm.phone}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, phone: e.target.value }))
            }
          />
        </label>
        <label className="block text-xs">
          Роль
          <select
            className="mt-1 w-full border border-line px-3 py-2 text-sm"
            value={createForm.role}
            onChange={(e) =>
              setCreateForm((f) => ({
                ...f,
                role: e.target.value as "USER" | "ADMIN",
              }))
            }
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN (единственный)</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={creating}
            className="h-10 w-full bg-ink text-sm text-paper disabled:opacity-50"
          >
            {creating ? "…" : "+ Создать"}
          </button>
        </div>
      </form>

      {/* READ list + UPDATE/DELETE actions */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted break-all">{u.email}</div>
                {u.phone ? (
                  <div className="text-xs text-muted">{u.phone}</div>
                ) : null}
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  u.role === "ADMIN"
                    ? "bg-ink text-paper"
                    : "border border-line text-muted"
                }`}
              >
                {u.role}
              </span>
            </div>

            {editId === u.id ? (
              <form onSubmit={saveEdit} className="mt-3 space-y-2 border-t border-line pt-3">
                <input
                  className="w-full border border-line px-2 py-1.5 text-sm"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Имя"
                />
                <input
                  className="w-full border border-line px-2 py-1.5 text-sm"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="Телефон"
                />
                <input
                  type="password"
                  className="w-full border border-line px-2 py-1.5 text-sm"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Новый пароль (опц.)"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-ink px-3 py-1.5 text-xs text-paper"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="border border-line px-3 py-1.5 text-xs"
                    onClick={() => setEditId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="underline"
                  onClick={() => startEdit(u)}
                >
                  Update
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
                    disabled={busyId === u.id || u.id === currentUserId}
                    className="underline disabled:opacity-50"
                    onClick={() => setRole(u.id, "USER")}
                  >
                    <span className="inline-flex items-center gap-1">
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                      user
                    </span>
                  </button>
                )}
                {u.id !== currentUserId ? (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    className="text-red-600 underline disabled:opacity-50"
                    onClick={() => remove(u.id)}
                  >
                    Delete
                  </button>
                ) : (
                  <span className="text-muted">это вы</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto border border-line bg-paper md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted">
            <tr>
              <th className="p-3">Имя</th>
              <th className="p-3">Email</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Роль</th>
              <th className="p-3">CRUD</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line align-top">
                <td className="p-3">
                  {editId === u.id ? (
                    <input
                      className="w-full border border-line px-2 py-1 text-sm"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="p-3 text-xs">{u.email}</td>
                <td className="p-3 text-xs">
                  {editId === u.id ? (
                    <input
                      className="w-full border border-line px-2 py-1 text-sm"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  ) : (
                    u.phone || "—"
                  )}
                </td>
                <td className="p-3 text-xs uppercase">{u.role}</td>
                <td className="p-3 text-xs">
                  {editId === u.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="password"
                        className="border border-line px-2 py-1"
                        placeholder="Новый пароль"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            password: e.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="underline"
                          onClick={(e) => {
                            e.preventDefault();
                            void saveEdit(e as unknown as React.FormEvent);
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="underline"
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="text-left underline"
                        onClick={() => startEdit(u)}
                      >
                        Update
                      </button>
                      {u.role === "USER" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          className="text-left underline disabled:opacity-50"
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
                          disabled={busyId === u.id || u.id === currentUserId}
                          className="text-left underline disabled:opacity-50"
                          onClick={() => setRole(u.id, "USER")}
                        >
                          <span className="inline-flex items-center gap-1">
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                            user
                          </span>
                        </button>
                      )}
                      {u.id !== currentUserId ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          className="text-left text-red-600 underline disabled:opacity-50"
                          onClick={() => remove(u.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        C: форма выше · R: таблица · U: Update / роль / пароль · D: Delete.
        Admin только один.
      </p>
    </div>
  );
}
