import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  blobConfigured,
  processAndSaveImage,
  validateImageFile,
} from "@/lib/images";

/**
 * What the product's gallery holds right now.
 *
 * Photos are uploaded one request per file, so a batch that stops halfway
 * leaves the panel holding a list it can no longer vouch for. It asks here
 * instead of guessing from a response that never came.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId } = await ctx.params;
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ images });
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!blobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Хранилище фото не подключено: в настройках проекта нет BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const colorKeyRaw = form.get("colorKey");
  const colorKey =
    typeof colorKeyRaw === "string" && colorKeyRaw.trim()
      ? colorKeyRaw.trim().toLowerCase()
      : null;

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
      validateImageFile({ name: file.name, type: file.type, size: file.size });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid file" },
        { status: 400 },
      );
    }
    try {
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
          colorKey,
        },
      });
      created.push(image);
    } catch (e) {
      console.error("image upload failed", file.name, e);
      // Files earlier in the batch are already saved, so name the one that
      // stopped it rather than implying nothing landed.
      return NextResponse.json(
        {
          error: `Не удалось сохранить «${file.name}»: ${
            e instanceof Error ? e.message : "ошибка хранилища"
          }`,
          created,
        },
        { status: 502 },
      );
    }
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });

  revalidateCatalog();
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
    imageId?: string;
    colorKey?: string | null;
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

  if (body.imageId && "colorKey" in body) {
    const colorKey =
      body.colorKey && body.colorKey.trim()
        ? body.colorKey.trim().toLowerCase()
        : null;
    await prisma.productImage.update({
      where: { id: body.imageId },
      data: { colorKey },
    });
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
  revalidateCatalog();
  return NextResponse.json({ images });
}
