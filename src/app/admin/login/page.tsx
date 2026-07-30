"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Неверный пароль");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="mb-6 text-center text-xs tracking-[0.3em] uppercase">
        Danial CN Admin
      </h1>
      <form onSubmit={onSubmit} className="space-y-4 border border-[#e5e5e5] bg-white p-6">
        <label className="block text-xs">
          Password
          <input
            type="password"
            className="mt-1 w-full border border-[#e5e5e5] px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="h-10 w-full bg-[#111] text-sm text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}
