/**
 * Point the admin account at ADMIN_PASSWORD.
 *
 * `db:seed` will not touch an admin that already exists, so a later change to
 * the env (or a password that was only ever printed once) leaves the panel
 * answering "Неверный email или пароль". This script is safe to rerun.
 */
import "dotenv/config";
import { cliPrisma, cliTarget } from "./prisma-cli-client";
import { hashPassword } from "../src/lib/password";
import { syncAdminPassword } from "../src/lib/sync-admin";

const prisma = cliPrisma();

async function main() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    console.log("skip admin reset: ADMIN_PASSWORD is not set");
    return;
  }

  console.log("admin reset →", cliTarget());
  const result = await syncAdminPassword({
    store: {
      findAdmin: () =>
        prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true, email: true, role: true },
        }),
      findByEmail: (email) =>
        prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, role: true },
        }),
      updatePassword: async (id, data) => {
        await prisma.user.update({
          where: { id },
          data: {
            passwordHash: data.passwordHash,
            ...(data.role ? { role: data.role } : {}),
            sessionVersion: { increment: 1 },
            blockedAt: null,
          },
        });
      },
      createAdmin: async (data) => {
        await prisma.user.create({
          data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
            phone: "",
            role: "ADMIN",
          },
        });
      },
    },
    hashPassword,
    email: process.env.ADMIN_EMAIL || "admin@danial.cn",
    password,
    name: process.env.ADMIN_NAME || "Admin",
  });

  console.log(`${result.action} admin:`, result.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
