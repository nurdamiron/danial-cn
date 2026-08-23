"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductDeleteButton({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Удалить товар «${name}»?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Не удалось удалить");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      className="btn border-danger/30 text-danger h-10 px-5 text-[0.8125rem] disabled:opacity-50"
    >
      {busy ? "Удаление…" : "Удалить товар"}
    </button>
  );
}
