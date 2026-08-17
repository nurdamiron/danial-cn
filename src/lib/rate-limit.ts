/**
 * Sign-in throttling, backed by the database rather than process memory.
 *
 * Serverless functions are the wrong place for an in-memory counter: every
 * cold start begins at zero and requests fan out across instances, so an
 * attacker gets the full budget per instance. The attempt table is shared by
 * all of them, and doubles as the admin security log.
 */
import { prisma } from "@/lib/prisma";

export const LOGIN_WINDOW_MINUTES = 15;
/** Failures against one address before that account stops answering. */
export const MAX_FAILURES_PER_EMAIL = 8;
/** Failures from one address before it stops being served at all. */
export const MAX_FAILURES_PER_IP = 25;
export const REGISTER_WINDOW_MINUTES = 60;
export const MAX_REGISTRATIONS_PER_IP = 10;
const RETENTION_DAYS = 30;

export type ThrottleResult =
  | { blocked: false }
  | { blocked: true; retryAfterSeconds: number };

export type AttemptReason =
  | "no_user"
  | "bad_password"
  | "blocked"
  | "rate_limited"
  | "ok";

/**
 * The caller's address as the platform reports it. Vercel puts the real client
 * first in x-forwarded-for; anything after it is proxy hops.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() ?? "";
}

function retryAfter(oldest: Date, windowMinutes: number): number {
  const freeAt = oldest.getTime() + windowMinutes * 60_000;
  return Math.max(1, Math.ceil((freeAt - Date.now()) / 1000));
}

async function oldestFailure(
  where: { email?: string; ip?: string },
  windowMinutes: number,
  limit: number,
): Promise<Date | null> {
  const since = new Date(Date.now() - windowMinutes * 60_000);
  const failures = await prisma.loginAttempt.findMany({
    where: { ...where, action: "login", success: false, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { createdAt: true },
  });
  return failures.length >= limit ? failures[0].createdAt : null;
}

export async function checkLoginThrottle(input: {
  email: string;
  ip: string;
}): Promise<ThrottleResult> {
  const [byEmail, byIp] = await Promise.all([
    oldestFailure({ email: input.email }, LOGIN_WINDOW_MINUTES, MAX_FAILURES_PER_EMAIL),
    input.ip
      ? oldestFailure({ ip: input.ip }, LOGIN_WINDOW_MINUTES, MAX_FAILURES_PER_IP)
      : Promise.resolve(null),
  ]);

  const oldest = byEmail ?? byIp;
  if (!oldest) return { blocked: false };
  return {
    blocked: true,
    retryAfterSeconds: retryAfter(oldest, LOGIN_WINDOW_MINUTES),
  };
}

export async function checkRegisterThrottle(ip: string): Promise<ThrottleResult> {
  if (!ip) return { blocked: false };

  const since = new Date(Date.now() - REGISTER_WINDOW_MINUTES * 60_000);
  const recent = await prisma.loginAttempt.findMany({
    where: { ip, action: "register", success: true, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    take: MAX_REGISTRATIONS_PER_IP,
    select: { createdAt: true },
  });

  if (recent.length < MAX_REGISTRATIONS_PER_IP) return { blocked: false };
  return {
    blocked: true,
    retryAfterSeconds: retryAfter(recent[0].createdAt, REGISTER_WINDOW_MINUTES),
  };
}

export async function recordAttempt(input: {
  action: "login" | "register";
  email: string;
  ip: string;
  success: boolean;
  reason: AttemptReason;
}): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        action: input.action,
        email: input.email.slice(0, 120),
        ip: input.ip.slice(0, 64),
        success: input.success,
        reason: input.reason,
      },
    });
  } catch {
    // Never let bookkeeping fail a sign-in the user got right.
  }
}

/**
 * A correct password clears the account's failure streak, so someone who
 * mistyped a few times and then got it right is not left locked out.
 */
export async function clearFailures(email: string): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({
      where: { email, action: "login", success: false },
    });
    await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - RETENTION_DAYS * 86_400_000) } },
    });
  } catch {
    // Same reasoning as above.
  }
}

export const TOO_MANY_ATTEMPTS_ERROR =
  "Слишком много попыток входа. Попробуйте позже.";
export const TOO_MANY_REGISTRATIONS_ERROR =
  "Слишком много регистраций с этого адреса. Попробуйте позже.";
