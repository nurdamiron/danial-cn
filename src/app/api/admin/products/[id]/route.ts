import { NextResponse } from "next/server";
import { z } from "zod";
import { firstIssueMessage } from "@/lib/validation-message";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { assertPublishable } from "@/lib/products";
import { syncProductTranslations } from "@/lib/translation-sync";
import { isUniqueViolation } from "@/lib/prisma-errors";

const patchSchema = z.object({
  slug: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  nameRu: z.string().min(1).optional(),
  nameKk: z.string().min(1).optional(),
  descriptionRu: z.string().optional(),
  descriptionKk: z.string().optional(),
  materialRu: z.string().optional(),
  materialKk: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  basePriceKzt: z.number().int().positive().optional(),
  heightCm: z.number().optional().nullable(),
  widthCm: z.number().optional().nullable(),
  depthCm: z.number().optional().nullable(),
  volumeL: z.number().optional().nullable(),
  weightKg: z.number().optional().nullable(),
  wheels: z.string().optional().nullable(),
  lockType: z.string().optional().nullable(),
  status: z.enum(["draft", "active"]).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Сессия истекла — войдите заново" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Не найдено — возможно, уже удалено" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Сессия истекла — войдите заново" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 },
    );
  }

  if (parsed.data.status === "active") {
    try {
      await assertPublishable(id);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Cannot publish" },
        { status: 400 },
      );
    }
  }

  // The panel no longer asks for the Kazakh half of each text, so it is
  // worked out here — mirrored where it was only ever a copy, left alone
  // where somebody actually translated it.
  const stored = await prisma.product.findUnique({
    where: { id },
    select: {
      nameRu: true,
      nameKk: true,
      descriptionRu: true,
      descriptionKk: true,
      materialRu: true,
      materialKk: true,
    },
  });
  if (!stored) {
    return NextResponse.json({ error: "Не найдено — возможно, уже удалено" }, { status: 404 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { ...parsed.data, ...syncProductTranslations(stored, parsed.data) },
      include: {
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
        variants: true,
      },
    });
    revalidateCatalog();
    return NextResponse.json({ product });
  } catch (e) {
    // Every failure here used to answer "Not found", including the common
    // one: a page address another product already has.
    if (isUniqueViolation(e)) {
      return NextResponse.json(
        { error: "Такой адрес страницы уже занят другим товаром" },
        { status: 409 },
      );
    }
    console.error("product update failed", e);
    return NextResponse.json(
      { error: "Не удалось сохранить товар" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Сессия истекла — войдите заново" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id } });
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не найдено — возможно, уже удалено" }, { status: 404 });
  }
}
