import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/auth";
import { deriveVariant } from "@/lib/variant-defaults";

const variantSchema = z.object({
  colorKey: z.string("Выберите цвет").min(1, "Выберите цвет"),
  sizeKey: z.string("Выберите размер").min(1, "Выберите размер"),
  // Derived from the two above when the panel does not spell them out.
  sku: z.string().optional().nullable(),
  colorLabelRu: z.string().optional().nullable(),
  colorLabelKk: z.string().optional().nullable(),
  colorHex: z.string().optional().nullable(),
  sizeLabelRu: z.string().optional().nullable(),
  sizeLabelKk: z.string().optional().nullable(),
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

  const derived = deriveVariant({
    slug: product.slug,
    ...parsed.data,
    colorKey: parsed.data.colorKey.trim().toLowerCase(),
  });

  // The pair, not the SKU, is what the shop means by a duplicate: the same
  // colour in the same size cannot exist twice on one product, whatever it
  // ends up being called.
  const samePair = await prisma.productVariant.findFirst({
    where: {
      productId,
      colorKey: derived.colorKey,
      sizeKey: derived.sizeKey,
    },
  });
  if (samePair) {
    return NextResponse.json(
      {
        error: `${derived.colorLabelRu} · ${derived.sizeLabelRu} уже есть у этого товара`,
      },
      { status: 409 },
    );
  }

  const skuTaken = await prisma.productVariant.findUnique({
    where: { sku: derived.sku },
  });
  if (skuTaken) {
    return NextResponse.json(
      { error: `Артикул ${derived.sku} уже занят` },
      { status: 409 },
    );
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      ...derived,
      priceKzt: parsed.data.priceKzt ?? null,
      stock: parsed.data.stock ?? 0,
    },
  });

  revalidateCatalog();
  return NextResponse.json({ variant }, { status: 201 });
}
