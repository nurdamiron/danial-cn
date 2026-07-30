"use client";

export function AdminLogout() {
  return (
    <button
      type="button"
      className="underline"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Logout
    </button>
  );
}
