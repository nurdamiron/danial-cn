import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  isAdminAuthenticated,
  ROLES,
  type Role,
} from "@/lib/auth";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(80),
  phone: z.string().max(32).optional().default(""),
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email уже занят" },
      { status: 409 },
    );
  }

  const role = (parsed.data.role ?? ROLES.USER) as Role;
  // New user id unknown until create — use temp check for ADMIN transfer
  if (role === ROLES.ADMIN) {
    // ok: will demote previous admins after create
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.$transaction(async (tx) => {
    if (role === ROLES.ADMIN) {
      await tx.user.updateMany({
        where: { role: ROLES.ADMIN },
        data: { role: ROLES.USER },
      });
    }
    return tx.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name.trim(),
        phone: (parsed.data.phone ?? "").trim(),
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  return NextResponse.json({ user }, { status: 201 });
}
