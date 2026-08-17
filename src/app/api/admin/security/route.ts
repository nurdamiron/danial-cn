import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

const DAY_MS = 86_400_000;

/**
 * The sign-in log behind /admin/security: who got in, who kept missing, and
 * from where. Same rows the throttle reads, so the numbers here are the ones
 * that actually gate access.
 */
export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const onlyFailures = url.searchParams.get("failures") === "1";
  const since24h = new Date(Date.now() - DAY_MS);

  const [attempts, failed24h, ok24h, registered24h] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: onlyFailures ? { success: false } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        email: true,
        ip: true,
        success: true,
        reason: true,
        createdAt: true,
      },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: false, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "login", success: true, createdAt: { gte: since24h } },
    }),
    prisma.loginAttempt.count({
      where: { action: "register", createdAt: { gte: since24h } },
    }),
  ]);

  return NextResponse.json(
    {
      attempts,
      stats: { failed24h, ok24h, registered24h },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
