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
 *
 * Which of the two it is depends only on whether a mail provider is
 * configured — never on the address that was typed — so neither answer says
 * anything about who has an account here.
 */
const MAILED = {
  ok: true,
  message:
    "Если аккаунт с такой почтой есть, мы отправим ссылку для восстановления. Не пришло письмо — напишите нам в WhatsApp, мы вышлем ссылку туда.",
};

/**
 * With no provider configured the shop cannot send anything, and promising a
 * letter that never arrives leaves the customer waiting instead of asking.
 * WhatsApp is the channel this shop actually answers on.
 */
const ASK_ON_WHATSAPP = {
  ok: true,
  message:
    "Восстановление по почте пока не подключено. Напишите нам в WhatsApp — вышлем ссылку для смены пароля.",
};

function sameAnswer() {
  return mailerConfigured() ? MAILED : ASK_ON_WHATSAPP;
}

export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(sameAnswer());
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(sameAnswer());
  }

  // Nothing here can reach the customer without a provider, and a token that
  // is never delivered is only a row in the table and a slot out of the
  // hourly budget the admin needs to issue the link by hand.
  if (!mailerConfigured()) {
    return NextResponse.json(sameAnswer());
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.blockedAt) {
    return NextResponse.json(sameAnswer());
  }

  const recent = await prisma.passwordReset.count({
    where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
  });
  if (recent >= MAX_RESETS_PER_HOUR) {
    return NextResponse.json(sameAnswer());
  }

  const { token, tokenHash } = createResetToken();
  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash, expiresAt: resetExpiry(), issuedBy: "self" },
  });

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

  return NextResponse.json(sameAnswer());
}
