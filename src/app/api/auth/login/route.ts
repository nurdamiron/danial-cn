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
import { hasDatabase, NO_DATABASE_ERROR } from "@/lib/db-config";
import {
  checkLoginThrottle,
  purgeOldAttempts,
  clientIp,
  recordAttempt,
  TOO_MANY_ATTEMPTS_ERROR,
} from "@/lib/rate-limit";

const INVALID = "Неверный email или пароль";
const BLOCKED = "Аккаунт заблокирован. Обратитесь к администратору.";

export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: NO_DATABASE_ERROR }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip = clientIp(req);

  const throttle = await checkLoginThrottle({ email, ip });
  if (throttle.blocked) {
    await recordAttempt({
      action: "login",
      email,
      ip,
      success: false,
      reason: "rate_limited",
    });
    return NextResponse.json(
      { error: TOO_MANY_ATTEMPTS_ERROR },
      {
        status: 429,
        headers: { "Retry-After": String(throttle.retryAfterSeconds) },
      },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await recordAttempt({
      action: "login",
      email,
      ip,
      success: false,
      reason: "no_user",
    });
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  // Checked before the password so a blocked account cannot be used to tell
  // a right password from a wrong one.
  if (user.blockedAt) {
    await recordAttempt({
      action: "login",
      email,
      ip,
      success: false,
      reason: "blocked",
    });
    return NextResponse.json({ error: BLOCKED }, { status: 403 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    await recordAttempt({
      action: "login",
      email,
      ip,
      success: false,
      reason: "bad_password",
    });
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  await purgeOldAttempts();
  await recordAttempt({
    action: "login",
    email,
    ip,
    success: true,
    reason: "ok",
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const sessionUser = toSessionUser(user);
  const res = NextResponse.json({ user: publicUser(sessionUser) });
  res.cookies.set(
    SESSION_COOKIE,
    createSessionToken(sessionUser),
    sessionCookieOptions(),
  );
  return res;
}
