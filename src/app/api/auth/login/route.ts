import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  publicUser,
  sessionCookieOptions,
  SESSION_COOKIE,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/auth-validation";
import { isStaticCatalog } from "@/lib/static-catalog";

export async function POST(req: Request) {
  if (isStaticCatalog()) {
    return NextResponse.json(
      {
        error:
          "Вход недоступен в static-режиме (Vercel). Запустите локально.",
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

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  const sessionUser = toSessionUser(user);
  const res = NextResponse.json({ user: publicUser(sessionUser) });
  res.cookies.set(
    SESSION_COOKIE,
    createSessionToken(sessionUser),
    sessionCookieOptions(),
  );
  return res;
}
