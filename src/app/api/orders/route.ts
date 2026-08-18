import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { clientIp } from "@/lib/rate-limit";
import { generateOrderNumber, priceOrder } from "@/lib/orders";

const orderSchema = z.object({
  locale: z.enum(["ru", "kk"]).default("ru"),
  source: z.enum(["cart", "quick"]).default("cart"),
  meta: z.object({
    name: z.string().min(1).max(120),
    city: z.string().min(1).max(120),
    phone: z.string().max(40).optional().default(""),
    delivery: z.enum(["cargo", "avia", "express"]),
    comment: z.string().max(2000).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(200),
        variantId: z.string().max(200).optional(),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
});

const MAX_ORDERS_PER_IP_PER_HOUR = 20;

/** The signed-in customer's own orders, with the status the shop set. */
export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json(
      { orders: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { orders: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      number: true,
      status: true,
      totalKzt: true,
      city: true,
      customerName: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          name: true,
          colorLabel: true,
          sizeLabel: true,
          qty: true,
        },
      },
    },
  });

  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  // The storefront works without a database; an order simply cannot be
  // recorded then, and the caller falls back to sending the message anyway.
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "Заказы сейчас не сохраняются" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  if (ip) {
    const recent = await prisma.order.count({
      where: { ip, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
    });
    if (recent >= MAX_ORDERS_PER_IP_PER_HOUR) {
      return NextResponse.json(
        { error: "Слишком много заказов подряд. Напишите нам в WhatsApp." },
        { status: 429 },
      );
    }
  }

  const priced = priceOrder(parsed.data.items, parsed.data.locale);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const user = await getCurrentUser();
  const meta = parsed.data.meta;

  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      userId: user?.id ?? null,
      customerName: meta.name.trim(),
      customerPhone: (meta.phone ?? "").trim(),
      city: meta.city.trim(),
      delivery: meta.delivery,
      comment: (meta.comment ?? "").trim(),
      totalKzt: priced.totalKzt,
      source: parsed.data.source,
      ip,
      items: { create: priced.items },
    },
    select: { id: true, number: true, totalKzt: true, createdAt: true },
  });

  return NextResponse.json({ order }, { status: 201 });
}
