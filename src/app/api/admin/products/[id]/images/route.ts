import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { processAndSaveImage, validateImageFile } from "@/lib/images";

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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const existingCount = await prisma.productImage.count({
    where: { productId },
  });
  const created = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      validateImageFile({ type: file.type, size: file.size });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid file" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await processAndSaveImage({
      productId,
      buffer,
      originalName: file.name,
    });
    const image = await prisma.productImage.create({
      data: {
        productId,
        url: saved.url,
        width: saved.width,
        height: saved.height,
        sortOrder: existingCount + i,
        isCover: existingCount === 0 && i === 0,
      },
    });
    created.push(image);
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ created, images });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId } = await ctx.params;
  const body = (await req.json()) as {
    coverId?: string;
    orderedIds?: string[];
  };

  if (body.coverId) {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId },
        data: { isCover: false },
      }),
      prisma.productImage.update({
        where: { id: body.coverId },
        data: { isCover: true },
      }),
    ]);
  }

  if (body.orderedIds?.length) {
    await prisma.$transaction(
      body.orderedIds.map((imageId, index) =>
        prisma.productImage.update({
          where: { id: imageId },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ images });
}
