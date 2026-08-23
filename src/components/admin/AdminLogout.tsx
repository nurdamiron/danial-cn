"use client";

export function AdminLogout() {
  return (
    <button
      type="button"
      className="text-[0.8125rem] text-muted underline-offset-2 hover:text-ink hover:underline"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Выйти
    </button>
  );
}
