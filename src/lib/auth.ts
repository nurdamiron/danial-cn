import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { hasDatabase } from "@/lib/db-config";

export { hashPassword, verifyPassword };

export const SESSION_COOKIE = "danial_session";
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
};

const SESSION_DAYS = 14;

function authSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "danial-cn-dev-secret-change-me"
  );
}

function sign(payload: string) {
  return createHmac("sha256", authSecret()).update(payload).digest("hex");
}

export function createSessionToken(user: {
  id: string;
  role: string;
}): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${user.id}:${user.role}:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(
  token: string | undefined,
): { userId: string; role: string; exp: number } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const [userId, role, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!userId || !role || !Number.isFinite(exp) || Date.now() > exp) {
    return null;
  }
  return { userId, role, exp };
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function toSessionUser(user: {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  // cookies() comes first on purpose: it is what marks the request dynamic.
  // Returning early on hasDatabase() left /api/auth/me and every page that
  // calls this with no dynamic API at all, so a build that ran without the
  // database baked "logged out" into the CDN — the cookie was then never read
  // again, even once the database was configured.
  const jar = await cookies();

  // Accounts need a durable store. The catalogue may still be static JSON —
  // these two are independent, so this checks the database, not the platform.
  if (!hasDatabase()) return null;

  const parsed = parseSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!parsed) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });
    if (!user) return null;
    return toSessionUser(user);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === ROLES.ADMIN;
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getCurrentUser());
}

/** Ensure the system never has more than one admin. */
export async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: ROLES.ADMIN } });
}

/**
 * Role rules:
 * - Promoting to ADMIN is always allowed (caller demotes previous admin).
 * - Demoting the sole ADMIN is blocked.
 */
export async function ensureSingleAdminRule(
  targetUserId: string,
  nextRole: Role,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (nextRole === ROLES.USER) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });
    if (target?.role === ROLES.ADMIN) {
      const admins = await countAdmins();
      if (admins <= 1) {
        return {
          ok: false,
          error:
            "Нельзя снять роль у единственного администратора. Сначала назначьте другого admin.",
        };
      }
    }
  }

  return { ok: true };
}

export function publicUser(user: SessionUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
}
