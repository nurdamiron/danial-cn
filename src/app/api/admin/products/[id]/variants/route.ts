import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { defaultColorHex } from "@/lib/color-hex";

const variantSchema = z.object({
  sku: z.string().min(1, "SKU обязателен"),
  colorKey: z.string().min(1),
  colorLabelRu: z.string().min(1),
  colorLabelKk: z.string().min(1),
  colorHex: z.string().optional().nullable(),
  sizeKey: z.string().min(1),
  sizeLabelRu: z.string().min(1),
  sizeLabelKk: z.string().min(1),
  priceKzt: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).default(0),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId } = await ctx.params;
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ colorKey: "asc" }, { sizeKey: "asc" }],
  });
  return NextResponse.json({ variants });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = variantSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  const sku = parsed.data.sku.trim();
  const exists = await prisma.productVariant.findUnique({ where: { sku } });
  if (exists) {
    return NextResponse.json({ error: "SKU уже существует" }, { status: 409 });
  }

  const colorKey = parsed.data.colorKey.trim().toLowerCase();
  const colorHex =
    parsed.data.colorHex?.trim() || defaultColorHex(colorKey);

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku,
      colorKey,
      colorLabelRu: parsed.data.colorLabelRu.trim(),
      colorLabelKk: parsed.data.colorLabelKk.trim(),
      colorHex,
      sizeKey: parsed.data.sizeKey.trim(),
      sizeLabelRu: parsed.data.sizeLabelRu.trim(),
      sizeLabelKk: parsed.data.sizeLabelKk.trim(),
      priceKzt: parsed.data.priceKzt ?? null,
      stock: parsed.data.stock ?? 0,
    },
  });

  return NextResponse.json({ variant }, { status: 201 });
}
