import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getCurrentUser,
  hashPassword,
  publicUser,
  sessionCookieOptions,
  SESSION_COOKIE,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/auth-validation";

export async function PATCH(req: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Ошибка валидации";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const data = parsed.data;
  const update: {
    name?: string;
    phone?: string;
    passwordHash?: string;
    sessionVersion?: { increment: number };
  } = {};

  if (data.name !== undefined) update.name = data.name.trim();
  if (data.phone !== undefined) update.phone = data.phone.trim();

  if (data.password) {
    const dbUser = await prisma.user.findUnique({
      where: { id: current.id },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!data.currentPassword) {
      return NextResponse.json(
        { error: "Введите текущий пароль" },
        { status: 400 },
      );
    }
    const ok = await verifyPassword(data.currentPassword, dbUser.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Неверный текущий пароль" },
        { status: 400 },
      );
    }
    update.passwordHash = await hashPassword(data.password);
    // A new password ends every session opened with the old one. This browser
    // gets a fresh cookie below, so the person changing it stays signed in.
    update.sessionVersion = { increment: 1 };
  }

  const user = await prisma.user.update({
    where: { id: current.id },
    data: update,
  });

  const sessionUser = toSessionUser(user);
  const res = NextResponse.json({ user: publicUser(sessionUser) });
  if (update.sessionVersion) {
    res.cookies.set(
      SESSION_COOKIE,
      createSessionToken(sessionUser),
      sessionCookieOptions(),
    );
  }
  return res;
}
