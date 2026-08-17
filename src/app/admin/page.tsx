import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportCatalogButton } from "@/components/admin/ExportCatalogButton";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { isStaticCatalog } from "@/lib/static-catalog";

const DAY_MS = 86_400_000;

/**
 * What the panel can still act on when the catalogue is a static export:
 * accounts, and who has been trying to get into them.
 */
async function accountStats() {
  const { prisma } = await import("@/lib/prisma");
  const since24h = new Date(Date.now() - DAY_MS);
  const since7d = new Date(Date.now() - 7 * DAY_MS);

  const [users, newUsers7d, blocked, ok24h, failed24h] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({ where: { blockedAt: { not: null } } }),
    prisma.loginAttempt.count({
      where: { action: "login", success: true, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: false, createdAt: { gte: since24h } },
    }),
  ]);

  return { users, newUsers7d, blocked, ok24h, failed24h };
}

function StatCard({
  href,
  value,
  label,
  alarm = false,
}: {
  href: string;
  value: number;
  label: string;
  alarm?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block border border-line bg-paper p-4 transition hover:border-ink"
    >
      <p className={`text-2xl font-light ${alarm ? "text-red-600" : ""}`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
    </Link>
  );
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
    const stats = accountsAvailable ? await accountStats() : null;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light">Обзор</h1>
          <p className="mt-1 text-sm text-muted">
            Здравствуйте, {user.name || "Admin"}.
          </p>
        </div>

        {stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                href="/admin/users"
                value={stats.users}
                label="Покупателей"
              />
              <StatCard
                href="/admin/users"
                value={stats.newUsers7d}
                label="Новых за неделю"
              />
              <StatCard
                href="/admin/security"
                value={stats.ok24h}
                label="Входов за сутки"
              />
              <StatCard
                href="/admin/security"
                value={stats.failed24h}
                label="Неудачных за сутки"
                alarm={stats.failed24h >= 8}
              />
            </div>

            {stats.blocked > 0 ? (
              <p className="border border-line bg-paper px-4 py-3 text-sm text-muted">
                Заблокированных аккаунтов: {stats.blocked}.{" "}
                <Link href="/admin/users" className="underline">
                  Посмотреть
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <div className="border border-line bg-paper p-5">
            <p className="text-sm text-muted">
              Личные кабинеты покупателей сейчас недоступны. Напишите
              разработчику, чтобы их включить.
            </p>
          </div>
        )}

        <div className="border border-line bg-paper p-5">
          <p className="text-sm font-medium">Каталог</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Товары, цены и фото обновляет разработчик. Если нужно что-то
            поменять в каталоге, напишите ему.
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
      title: "Товары",
      desc: "Добавление, редактирование, статус, фото и варианты, удаление.",
      href: "/admin/products",
    },
    {
      title: "Пользователи",
      desc: "Список, роли, пароли, удаление.",
      href: "/admin/users",
    },
    {
      title: "Настройки",
      desc: "WhatsApp, доставка, тексты про Kaspi.",
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
          + Новый товар
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex h-11 items-center justify-center border border-ink px-6 text-sm"
        >
          Пользователи
        </Link>
        <Link
          href="/admin/settings"
          className="inline-flex h-11 items-center justify-center border border-line px-6 text-sm"
        >
          Настройки
        </Link>
      </div>

      <div className="border border-line bg-paper p-4 sm:p-6">
        <h2 className="text-sm font-medium">Обновление сайта</h2>
        <p className="mt-1 text-xs text-muted">
          После правок в товарах нажмите кнопку — она подготовит каталог для
          сайта.
        </p>
        <div className="mt-4">
          <ExportCatalogButton />
        </div>
      </div>
    </div>
  );
}
