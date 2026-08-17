import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureSingleAdminRule,
  getCurrentUser,
  hashPassword,
  isAdminAuthenticated,
  ROLES,
  type Role,
} from "@/lib/auth";
import { adminUserUpdateSchema } from "@/lib/auth-validation";
import { ADMIN_USER_SELECT } from "@/lib/admin-users";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: ADMIN_USER_SELECT,
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = adminUserUpdateSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Ошибка валидации";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.role) {
    const check = await ensureSingleAdminRule(
      id,
      parsed.data.role as Role,
    );
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }
  }

  const data: {
    name?: string;
    phone?: string;
    role?: string;
    passwordHash?: string;
    blockedAt?: Date | null;
    sessionVersion?: { increment: number };
  } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.phone !== undefined) data.phone = parsed.data.phone.trim();
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
  }
  if (parsed.data.blocked !== undefined) {
    data.blockedAt = parsed.data.blocked ? new Date() : null;
  }

  // Anything that takes access away should take it away now, not in fourteen
  // days when the cookie expires on its own.
  if (
    parsed.data.password ||
    parsed.data.signOutEverywhere ||
    parsed.data.blocked === true ||
    parsed.data.role === ROLES.USER
  ) {
    data.sessionVersion = { increment: 1 };
  }

  // Blocking yourself or dropping your own admin rights locks the last way in.
  const me = await getCurrentUser();
  if (me?.id === id) {
    if (parsed.data.blocked === true) {
      return NextResponse.json(
        { error: "Нельзя заблокировать свой аккаунт" },
        { status: 400 },
      );
    }
    if (parsed.data.role === ROLES.USER) {
      return NextResponse.json(
        { error: "Нельзя снять роль с себя. Сначала назначьте другого admin." },
        { status: 400 },
      );
    }
  }

  // Transfer admin: promote target, demote previous admin in one transaction
  if (parsed.data.role === ROLES.ADMIN && existing.role !== ROLES.ADMIN) {
    const user = await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: { role: ROLES.ADMIN, NOT: { id } },
        data: { role: ROLES.USER },
      });
      return tx.user.update({
        where: { id },
        data,
        select: ADMIN_USER_SELECT,
      });
    });
    return NextResponse.json({ user });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: ADMIN_USER_SELECT,
  });

  return NextResponse.json({ user });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const me = await getCurrentUser();
  if (me?.id === id) {
    return NextResponse.json(
      { error: "Нельзя удалить свой аккаунт" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.role === ROLES.ADMIN) {
    const admins = await prisma.user.count({ where: { role: ROLES.ADMIN } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "Нельзя удалить единственного администратора" },
        { status: 400 },
      );
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
