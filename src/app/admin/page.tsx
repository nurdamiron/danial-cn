import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportCatalogButton } from "@/components/admin/ExportCatalogButton";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { isStaticCatalog } from "@/lib/static-catalog";

async function countUsers(): Promise<number> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.count();
}

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");

  // Static storefront: the catalogue comes from exported JSON, so product and
  // settings edits belong to a local run. Accounts live in the database and
  // stay editable here.
  if (isStaticCatalog()) {
    const accountsAvailable = hasDatabase();
    const userCount = accountsAvailable ? await countUsers() : 0;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light">Обзор</h1>
          <p className="mt-1 text-sm text-muted">
            Здравствуйте, {user.name || "Admin"}.
          </p>
        </div>

        {accountsAvailable ? (
          <Link
            href="/admin/users"
            className="block border border-line bg-paper p-5 transition hover:border-ink"
          >
            <p className="text-2xl font-light">{userCount}</p>
            <p className="mt-1 text-[11px] tracking-[0.16em] text-muted uppercase">
              Пользователи
            </p>
            <p className="mt-3 text-sm text-muted">
              Аккаунты в базе — создание, роли, пароли. Работает и на проде.
            </p>
          </Link>
        ) : (
          <div className="border border-line bg-paper p-5">
            <p className="text-sm text-muted">
              База данных не подключена. Добавьте{" "}
              <code className="text-ink">TURSO_DATABASE_URL</code> и{" "}
              <code className="text-ink">TURSO_AUTH_TOKEN</code>, чтобы вход и
              аккаунты работали.
            </p>
          </div>
        )}

        <div className="border border-line bg-paper p-5">
          <p className="text-sm font-medium">Каталог</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Витрина читает static JSON, поэтому товары и настройки правятся
            локально: <code className="text-ink">npm run dev</code> → правки →{" "}
            <code className="text-ink">npm run export:static</code> → коммит.
          </p>
          <Link href="/ru" className="mt-3 inline-block text-sm underline">
            Открыть сайт
          </Link>
        </div>
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
