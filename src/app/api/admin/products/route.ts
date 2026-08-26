import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/auth";
import { assertPublishable } from "@/lib/products";
import { defaultColorHex } from "@/lib/color-hex";
import { productSlugBase, uniqueSlug } from "@/lib/slug";

const productSchema = z.object({
  // Derived from the name when the panel does not send one.
  slug: z.string().optional(),
  brand: z.string().min(1),
  nameRu: z.string().min(1),
  // The shop is run in Russian; a Kazakh field left empty repeats the Russian
  // one so the /kk storefront still has something to print.
  nameKk: z.string().optional(),
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
  const nameKk = data.nameKk?.trim() || data.nameRu;
  const slug =
    data.slug?.trim() ||
    (await uniqueSlug(
      productSlugBase(data.brand, data.nameRu),
      async (candidate) =>
        (await prisma.product.findUnique({
          where: { slug: candidate },
          select: { id: true },
        })) !== null,
    ));

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
          sku: `${slug}-default`,
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
      slug,
      brand: data.brand,
      nameRu: data.nameRu,
      nameKk,
      descriptionRu: data.descriptionRu ?? "",
      descriptionKk: data.descriptionKk?.trim() || data.descriptionRu || "",
      materialRu: data.materialRu ?? "",
      materialKk: data.materialKk?.trim() || data.materialRu || "",
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

  revalidateCatalog();
  return NextResponse.json({ product });
}

// re-export assert for patch route usage pattern
void assertPublishable;
