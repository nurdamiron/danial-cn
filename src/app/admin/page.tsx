import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { formatKzt } from "@/lib/money";

const DAY_MS = 86_400_000;

async function overview() {
  const { prisma } = await import("@/lib/prisma");
  const since24h = new Date(Date.now() - DAY_MS);
  const since7d = new Date(Date.now() - 7 * DAY_MS);

  const [
    users,
    newUsers7d,
    blocked,
    ok24h,
    failed24h,
    newOrders,
    orders7d,
    revenue7d,
    products,
    drafts,
    outOfStock,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({ where: { blockedAt: { not: null } } }),
    prisma.loginAttempt.count({
      where: { action: "login", success: true, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: false, createdAt: { gte: since24h } },
    }),
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.count({ where: { createdAt: { gte: since7d } } }),
    prisma.order.aggregate({
      _sum: { totalKzt: true },
      where: { createdAt: { gte: since7d }, status: { notIn: ["cancelled"] } },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
  ]);

  return {
    users,
    newUsers7d,
    blocked,
    ok24h,
    failed24h,
    newOrders,
    orders7d,
    revenue7d: revenue7d._sum.totalKzt ?? 0,
    products,
    drafts,
    outOfStock,
  };
}

function StatCard({
  href,
  value,
  label,
  alarm = false,
  highlight = false,
}: {
  href: string;
  value: number | string;
  label: string;
  alarm?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block border bg-paper p-4 transition hover:border-ink ${
        highlight ? "border-ink" : "border-line"
      }`}
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

  if (!hasDatabase()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light">Обзор</h1>
          <p className="mt-1 text-sm text-muted">
            Здравствуйте, {user.name || "Admin"}.
          </p>
        </div>
        <div className="border border-line bg-paper p-5">
          <p className="text-sm text-muted">
            База данных сейчас недоступна, поэтому заказы, покупатели и каталог
            не читаются. Сайт продолжает работать на последнем снимке каталога.
          </p>
        </div>
      </div>
    );
  }

  const s = await overview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-light sm:text-2xl">Обзор</h1>
        <p className="mt-1 text-sm text-muted">
          Здравствуйте, {user.name}. Всё, что вы здесь меняете, появляется на
          сайте через несколько секунд.
        </p>
      </div>

      <div>
        <p className="mb-3 text-[11px] tracking-[0.16em] text-muted uppercase">
          Продажи
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            href="/admin/orders"
            value={s.newOrders}
            label="Новых заказов"
            highlight={s.newOrders > 0}
          />
          <StatCard
            href="/admin/orders"
            value={s.orders7d}
            label="Заказов за неделю"
          />
          <StatCard
            href="/admin/orders"
            value={formatKzt(s.revenue7d)}
            label="Сумма за неделю"
          />
          <StatCard href="/admin/users" value={s.users} label="Покупателей" />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] tracking-[0.16em] text-muted uppercase">
          Каталог
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            href="/admin/products"
            value={s.products}
            label="Товаров"
          />
          <StatCard
            href="/admin/products"
            value={s.drafts}
            label="Черновиков"
            highlight={s.drafts > 0}
          />
          <StatCard
            href="/admin/pricing"
            value={s.outOfStock}
            label="Позиций нет в наличии"
            alarm={s.outOfStock > 0}
          />
          <StatCard
            href="/admin/pricing"
            value="Цены"
            label="Цены и наличие"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] tracking-[0.16em] text-muted uppercase">
          Доступ
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            href="/admin/users"
            value={s.newUsers7d}
            label="Новых за неделю"
          />
          <StatCard
            href="/admin/security"
            value={s.ok24h}
            label="Входов за сутки"
          />
          <StatCard
            href="/admin/security"
            value={s.failed24h}
            label="Неудачных за сутки"
            alarm={s.failed24h >= 8}
          />
          {s.blocked > 0 ? (
            <StatCard
              href="/admin/users"
              value={s.blocked}
              label="Заблокировано"
              alarm
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
