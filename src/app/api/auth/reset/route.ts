import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  publicUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  toSessionUser,
} from "@/lib/auth";
import { hasDatabase, NO_DATABASE_ERROR } from "@/lib/db-config";
import { hashResetToken } from "@/lib/password-reset";

const schema = z.object({
  token: z.string().min(10).max(500),
  password: z.string().min(8, "Минимум 8 символов").max(72),
});

const BAD_LINK = "Ссылка недействительна или истекла. Запросите новую.";

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

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  // Looked up by hash rather than scanned: the stored value is the hash, so
  // this is an index hit and never compares the secret itself.
  const record = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(parsed.data.token) },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: BAD_LINK }, { status: 400 });
  }
  if (record.user.blockedAt) {
    return NextResponse.json({ error: BAD_LINK }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.$transaction(async (tx) => {
    await tx.passwordReset.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    // Every other pending link for this account dies with it, and so does
    // every session opened with the old password.
    await tx.passwordReset.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    return tx.user.update({
      where: { id: record.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
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
