"use client";

import { useEffect, useState } from "react";
import { cartCount, loadCart } from "@/store/cart";

export function CartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(cartCount(loadCart()));
    sync();
    window.addEventListener("danial-cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("danial-cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[10px] text-white">
      {count}
    </span>
  );
}
