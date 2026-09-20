import { redirect } from "next/navigation";
import { SecurityLog } from "@/components/admin/SecurityLog";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

const DAY_MS = 86_400_000;

async function loadLog() {
  const { prisma } = await import("@/lib/prisma");
  const since24h = new Date(Date.now() - DAY_MS);

  const [attempts, failed24h, ok24h, registered24h] = await Promise.all([
    prisma.loginAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        email: true,
        ip: true,
        success: true,
        reason: true,
        createdAt: true,
      },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: false, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: true, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "register", createdAt: { gte: since24h } },
    }),
  ]);

  return {
    attempts: attempts.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    stats: { failed24h, ok24h, registered24h },
  };
}

export default async function AdminSecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  const { attempts, stats } = await loadLog();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-light">Безопасность</h1>
        <p className="mt-1 text-sm text-muted">
          Кто заходил, кто пытался и откуда.
        </p>
      </div>
      <SecurityLog attempts={attempts} stats={stats} />
    </div>
  );
}
