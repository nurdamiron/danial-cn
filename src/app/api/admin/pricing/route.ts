import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { revalidateCatalog } from "@/lib/revalidate";

/**
 * Every buyable line in the shop on one screen.
 *
 * Changing a price used to mean opening a product, then a variant, then
 * saving, for each of them in turn. Prices move with the supplier and the
 * exchange rate, so this is the thing the shop does most often.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameRu: "asc" }],
    select: {
      id: true,
      slug: true,
      nameRu: true,
      brand: true,
      status: true,
      basePriceKzt: true,
      variants: {
        select: {
          id: true,
          colorLabelRu: true,
          colorHex: true,
          sizeLabelRu: true,
          sizeKey: true,
          priceKzt: true,
          stock: true,
        },
      },
    },
  });

  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "no-store" } },
  );
}

const patchSchema = z.object({
  rows: z
    .array(
      z.object({
        id: z.string().min(1),
        /** null means "use the product's base price". */
        priceKzt: z.number().int().min(0).max(100_000_000).nullable(),
        stock: z.number().int().min(0).max(100_000),
      }),
    )
    .min(1)
    .max(500),
});

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // One transaction: a half-applied price list is worse than a rejected one.
  await prisma.$transaction(
    parsed.data.rows.map((row) =>
      prisma.productVariant.update({
        where: { id: row.id },
        data: { priceKzt: row.priceKzt, stock: row.stock },
      }),
    ),
  );

  revalidateCatalog();

  return NextResponse.json({ ok: true, updated: parsed.data.rows.length });
}
