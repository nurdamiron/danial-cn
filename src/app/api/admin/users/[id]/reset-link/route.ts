import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { getStoreOrigin } from "@/lib/hosts";
import {
  buildResetUrl,
  createResetToken,
  RESET_TTL_MINUTES,
  resetExpiry,
} from "@/lib/password-reset";

/**
 * A reset link the admin can paste into WhatsApp.
 *
 * That is the channel this shop actually reaches its customers on, so it is
 * the delivery that works today — email needs a provider and is optional.
 * The link is shown once, here: only its hash is stored.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { token, tokenHash } = createResetToken();
  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash, expiresAt: resetExpiry(), issuedBy: "admin" },
  });

  return NextResponse.json({
    url: buildResetUrl(getStoreOrigin(), token),
    expiresInMinutes: RESET_TTL_MINUTES,
    email: user.email,
  });
}
