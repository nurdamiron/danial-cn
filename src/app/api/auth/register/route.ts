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
import { hasDatabase, NO_DATABASE_ERROR } from "@/lib/db-config";
import {
  checkRegisterThrottle,
  clientIp,
  recordAttempt,
  TOO_MANY_REGISTRATIONS_ERROR,
} from "@/lib/rate-limit";

const EMAIL_TAKEN = "Пользователь с таким email уже есть";

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

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Ошибка валидации";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip = clientIp(req);

  const throttle = await checkRegisterThrottle(ip);
  if (throttle.blocked) {
    return NextResponse.json(
      { error: TOO_MANY_REGISTRATIONS_ERROR },
      {
        status: 429,
        headers: { "Retry-After": String(throttle.retryAfterSeconds) },
      },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: EMAIL_TAKEN }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name.trim(),
        phone: (parsed.data.phone ?? "").trim(),
        role: ROLES.USER,
      },
    });
  } catch {
    // Two requests for the same address can both pass the check above and
    // race to insert. The unique index settles it; the loser gets the same
    // answer it would have got a moment earlier, not a 500.
    return NextResponse.json({ error: EMAIL_TAKEN }, { status: 409 });
  }

  await recordAttempt({
    action: "register",
    email,
    ip,
    success: true,
    reason: "ok",
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
