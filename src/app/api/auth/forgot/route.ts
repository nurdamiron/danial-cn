import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/db-config";
import { getStoreOrigin } from "@/lib/hosts";
import { mailerConfigured, sendMail } from "@/lib/mailer";
import {
  buildResetUrl,
  createResetToken,
  MAX_RESETS_PER_HOUR,
  RESET_TTL_MINUTES,
  resetExpiry,
} from "@/lib/password-reset";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["ru", "kk"]).default("ru"),
});

/**
 * Always answers the same way, whether or not the address has an account.
 * Anything else turns this into a way to find out who shops here.
 */
const SAME_ANSWER = {
  ok: true,
  message:
    "Если аккаунт с такой почтой есть, мы отправим ссылку для восстановления. Не пришло письмо — напишите нам в WhatsApp, мы вышлем ссылку туда.",
};

export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(SAME_ANSWER);
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(SAME_ANSWER);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.blockedAt) {
    return NextResponse.json(SAME_ANSWER);
  }

  const recent = await prisma.passwordReset.count({
    where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
  });
  if (recent >= MAX_RESETS_PER_HOUR) {
    return NextResponse.json(SAME_ANSWER);
  }

  const { token, tokenHash } = createResetToken();
  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash, expiresAt: resetExpiry(), issuedBy: "self" },
  });

  if (mailerConfigured()) {
    const url = buildResetUrl(getStoreOrigin(), token, parsed.data.locale);
    await sendMail({
      to: email,
      subject: "Danial CN, восстановление пароля",
      text: [
        "Вы просили сбросить пароль в Danial CN.",
        "",
        url,
        "",
        `Ссылка действует ${RESET_TTL_MINUTES} минут и работает один раз.`,
        "Если это были не вы, просто не переходите по ссылке.",
      ].join("\n"),
    });
  }

  return NextResponse.json(SAME_ANSWER);
}
