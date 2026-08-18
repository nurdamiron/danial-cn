import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/auth";
import { defaultColorHex } from "@/lib/color-hex";

const patchSchema = z.object({
  sku: z.string().min(1).optional(),
  colorKey: z.string().min(1).optional(),
  colorLabelRu: z.string().min(1).optional(),
  colorLabelKk: z.string().min(1).optional(),
  colorHex: z.string().optional().nullable(),
  sizeKey: z.string().min(1).optional(),
  sizeLabelRu: z.string().min(1).optional(),
  sizeLabelKk: z.string().min(1).optional(),
  priceKzt: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; variantId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId, variantId } = await ctx.params;

  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Вариант не найден" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400 },
    );
  }

  if (parsed.data.sku && parsed.data.sku !== existing.sku) {
    const clash = await prisma.productVariant.findUnique({
      where: { sku: parsed.data.sku },
    });
    if (clash) {
      return NextResponse.json(
        { error: "SKU уже существует" },
        { status: 409 },
      );
    }
  }

  const colorKey = parsed.data.colorKey?.trim().toLowerCase();
  let colorHex: string | undefined;
  if (parsed.data.colorHex !== undefined) {
    colorHex =
      parsed.data.colorHex?.trim() ||
      (colorKey ? defaultColorHex(colorKey) : defaultColorHex(existing.colorKey));
  } else if (colorKey) {
    colorHex = defaultColorHex(colorKey);
  }

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku: parsed.data.sku?.trim(),
      colorKey,
      colorLabelRu: parsed.data.colorLabelRu?.trim(),
      colorLabelKk: parsed.data.colorLabelKk?.trim(),
      ...(colorHex !== undefined ? { colorHex } : {}),
      sizeKey: parsed.data.sizeKey?.trim(),
      sizeLabelRu: parsed.data.sizeLabelRu?.trim(),
      sizeLabelKk: parsed.data.sizeLabelKk?.trim(),
      priceKzt: parsed.data.priceKzt,
      stock: parsed.data.stock,
    },
  });

  revalidateCatalog();
  return NextResponse.json({ variant });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; variantId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId, variantId } = await ctx.params;

  const existing = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Вариант не найден" }, { status: 404 });
  }

  const count = await prisma.productVariant.count({ where: { productId } });
  if (count <= 1) {
    return NextResponse.json(
      { error: "Нельзя удалить последний вариант товара" },
      { status: 400 },
    );
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
  revalidateCatalog();
  return NextResponse.json({ ok: true });
}
