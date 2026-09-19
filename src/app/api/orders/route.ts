import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { clientIp } from "@/lib/rate-limit";
import { generateOrderNumber, priceOrder } from "@/lib/orders";
import { listActiveProducts } from "@/lib/products";
import type { PricingCatalogProduct } from "@/lib/orders";

const orderSchema = z.object({
  locale: z.enum(["ru", "kk"]).default("ru"),
  source: z.enum(["cart", "quick"]).default("cart"),
  meta: z.object({
    name: z.string().min(1, "Укажите имя").max(120, "Имя слишком длинное"),
    city: z.string().min(1, "Укажите город").max(120, "Название города слишком длинное"),
    phone: z.string().max(40, "Телефон слишком длинный").optional().default(""),
    delivery: z.enum(["cargo", "avia", "express"], {
      message: "Выберите способ доставки",
    }),
    comment: z.string().max(2000, "Комментарий слишком длинный").optional().default(""),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1, "Товар не указан").max(200, "Товар не указан"),
        variantId: z.string().max(200, "Комплектация не найдена").optional(),
        qty: z
          .number("Неверное количество")
          .int("Неверное количество")
          .min(1, "Количество должно быть не меньше 1")
          .max(20, "За один заказ можно взять не больше 20 штук"),
      }),
      { message: "Корзина пуста" },
    )
    .min(1, "Корзина пуста"),
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

  // The live catalogue, so the order is filed at the price the customer was
  // shown. listActiveProducts falls back to the snapshot by itself when the
  // database cannot be reached, which is the one case where a stale price
  // beats refusing the sale.
  const catalog = (await listActiveProducts()) as unknown as
    PricingCatalogProduct[];
  const priced = priceOrder(parsed.data.items, parsed.data.locale, catalog);
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
