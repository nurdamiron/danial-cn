import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportCatalogButton } from "@/components/admin/ExportCatalogButton";
import { getCurrentUser } from "@/lib/auth";
import { isStaticCatalog } from "@/lib/static-catalog";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");

  if (isStaticCatalog()) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-light">Админ</h1>
        <p className="text-sm text-muted">
          На Vercel сейчас static-каталог (без записи в БД). Управление
          товарами, пользователями и регистрация — локально:{" "}
          <code className="text-ink">npm run dev</code>, затем деплой.
        </p>
        <Link href="/ru" className="text-sm underline">
          Открыть сайт
        </Link>
      </div>
    );
  }

  const { prisma } = await import("@/lib/prisma");
  const [productCount, activeCount, userCount, draftCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.user.count(),
    prisma.product.count({ where: { status: "draft" } }),
  ]);

  const cards = [
    { label: "Товары", value: productCount, href: "/admin/products" },
    { label: "Активные", value: activeCount, href: "/admin/products" },
    { label: "Черновики", value: draftCount, href: "/admin/products" },
    { label: "Пользователи", value: userCount, href: "/admin/users" },
  ];

  const crudLinks = [
    {
      title: "Products",
      desc: "C create · R list/filter · U status/fields · D delete + variants + photos",
      href: "/admin/products",
    },
    {
      title: "Users",
      desc: "C create · R list · U name/phone/role/password · D delete",
      href: "/admin/users",
    },
    {
      title: "Settings",
      desc: "R read · U update WhatsApp, delivery, Kaspi texts",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-light sm:text-2xl">Обзор</h1>
        <p className="mt-1 text-sm text-muted">
          Здравствуйте, {user.name}. Вы администратор.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-line bg-paper p-4 transition hover:border-ink"
          >
            <div className="text-2xl font-light">{c.value}</div>
            <div className="mt-1 text-xs tracking-wide text-muted uppercase">
              {c.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {crudLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="border border-line bg-paper p-4 transition hover:border-ink"
          >
            <div className="text-sm font-medium">{l.title}</div>
            <p className="mt-2 text-xs leading-relaxed text-muted">{l.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center bg-ink px-6 text-sm text-paper"
        >
          + Create product
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex h-11 items-center justify-center border border-ink px-6 text-sm"
        >
          Users CRUD
        </Link>
        <Link
          href="/admin/settings"
          className="inline-flex h-11 items-center justify-center border border-line px-6 text-sm"
        >
          Settings
        </Link>
      </div>

      <div className="border border-line bg-paper p-4 sm:p-6">
        <h2 className="text-sm font-medium">Публикация на Vercel</h2>
        <p className="mt-1 text-xs text-muted">
          Локально правите БД → Export static JSON → commit + deploy. На Vercel
          витрина читает static JSON.
        </p>
        <div className="mt-4">
          <ExportCatalogButton />
        </div>
      </div>
    </div>
  );
}
