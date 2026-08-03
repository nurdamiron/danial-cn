import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  publicUser,
  sessionCookieOptions,
  SESSION_COOKIE,
  toSessionUser,
  verifyPassword,
  ROLES,
} from "@/lib/auth";
import { hasDatabase, NO_DATABASE_ERROR } from "@/lib/db-config";

/**
 * Legacy + new login:
 * - { email, password } preferred
 * - { password } alone only matches the single ADMIN (compat)
 */
export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: NO_DATABASE_ERROR }, { status: 503 });
  }

  let body: { email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!password) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  let user = null;
  if (body.email) {
    user = await prisma.user.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });
  } else {
    // password-only: only admin account
    user = await prisma.user.findFirst({ where: { role: ROLES.ADMIN } });
  }

  if (!user) {
    return NextResponse.json(
      { error: "Неверный email или пароль" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
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
