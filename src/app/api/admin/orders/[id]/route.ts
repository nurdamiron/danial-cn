import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { ADMIN_ORDER_INCLUDE } from "@/lib/admin-orders";
import { ORDER_STATUSES } from "@/lib/orders";

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  comment: z.string().max(2000).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.comment !== undefined
        ? { comment: parsed.data.comment.trim() }
        : {}),
    },
    ...ADMIN_ORDER_INCLUDE,
  });

  return NextResponse.json({ order });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
