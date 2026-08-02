import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ROLES,
  createSessionToken,
  hashPassword,
  publicUser,
  sessionCookieOptions,
  SESSION_COOKIE,
  toSessionUser,
} from "@/lib/auth";
import { registerSchema } from "@/lib/auth-validation";
import { isStaticCatalog } from "@/lib/static-catalog";

export async function POST(req: Request) {
  if (isStaticCatalog()) {
    return NextResponse.json(
      {
        error:
          "Регистрация недоступна в static-режиме (Vercel). Запустите локально.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Ошибка валидации";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже есть" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name.trim(),
      phone: (parsed.data.phone ?? "").trim(),
      role: ROLES.USER,
    },
  });

  const sessionUser = toSessionUser(user);
  const res = NextResponse.json({
    user: publicUser(sessionUser),
  });
  res.cookies.set(
    SESSION_COOKIE,
    createSessionToken(sessionUser),
    sessionCookieOptions(),
  );
  return res;
}
