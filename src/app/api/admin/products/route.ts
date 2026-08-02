import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { assertPublishable } from "@/lib/products";
import { defaultColorHex } from "@/lib/color-hex";

const productSchema = z.object({
  slug: z.string().min(1),
  brand: z.string().min(1),
  nameRu: z.string().min(1),
  nameKk: z.string().min(1),
  descriptionRu: z.string().optional(),
  descriptionKk: z.string().optional(),
  materialRu: z.string().optional(),
  materialKk: z.string().optional(),
  category: z.string().default("cabin"),
  basePriceKzt: z.number().int().positive(),
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
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        colorKey: z.string().min(1),
        colorLabelRu: z.string().min(1),
        colorLabelKk: z.string().min(1),
        sizeKey: z.string().min(1),
        sizeLabelRu: z.string().min(1),
        sizeLabelKk: z.string().min(1),
        priceKzt: z.number().int().optional().nullable(),
        stock: z.number().int().default(0),
      }),
    )
    .optional(),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
      _count: { select: { images: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.status === "active") {
    // new product has no images yet
    return NextResponse.json(
      { error: "At least one product image is required" },
      { status: 400 },
    );
  }

  const variants = data.variants?.length
    ? data.variants
    : [
        {
          sku: `${data.slug}-default`,
          colorKey: "black",
          colorLabelRu: "Чёрный",
          colorLabelKk: "Қара",
          sizeKey: "55",
          sizeLabelRu: "55 см",
          sizeLabelKk: "55 см",
          priceKzt: null as number | null,
          stock: 5,
        },
      ];

  const product = await prisma.product.create({
    data: {
      slug: data.slug,
      brand: data.brand,
      nameRu: data.nameRu,
      nameKk: data.nameKk,
      descriptionRu: data.descriptionRu ?? "",
      descriptionKk: data.descriptionKk ?? "",
      materialRu: data.materialRu ?? "",
      materialKk: data.materialKk ?? "",
      category: data.category,
      basePriceKzt: data.basePriceKzt,
      heightCm: data.heightCm ?? null,
      widthCm: data.widthCm ?? null,
      depthCm: data.depthCm ?? null,
      volumeL: data.volumeL ?? null,
      weightKg: data.weightKg ?? null,
      wheels: data.wheels ?? null,
      lockType: data.lockType ?? null,
      status: "draft",
      featured: data.featured ?? false,
      sortOrder: data.sortOrder ?? 0,
      variants: {
        create: variants.map((v) => ({
          sku: v.sku,
          colorKey: v.colorKey,
          colorLabelRu: v.colorLabelRu,
          colorLabelKk: v.colorLabelKk,
          colorHex: defaultColorHex(v.colorKey),
          sizeKey: v.sizeKey,
          sizeLabelRu: v.sizeLabelRu,
          sizeLabelKk: v.sizeLabelKk,
          priceKzt: v.priceKzt ?? null,
          stock: v.stock ?? 0,
        })),
      },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json({ product });
}

// re-export assert for patch route usage pattern
void assertPublishable;
