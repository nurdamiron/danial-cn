import { redirect } from "next/navigation";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  // Accounts live in the database, not in the exported catalogue — so this
  // page works wherever there is a database, static storefront or not.
  if (!hasDatabase()) redirect("/admin");

  const { prisma } = await import("@/lib/prisma");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-light">Пользователи</h1>
        <p className="mt-1 text-sm text-muted">
          Новая регистрация — обычный покупатель. Администратор может быть
          только один.
        </p>
      </div>
      <UsersAdmin
        currentUserId={user.id}
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
