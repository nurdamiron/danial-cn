import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteImageFile } from "@/lib/images";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; imageId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId, imageId } = await ctx.params;
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteImageFile(image.url);

  if (image.isCover) {
    const next = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({
        where: { id: next.id },
        data: { isCover: true },
      });
    }
  }

  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });

  // Publishing needs a photo, so losing the last one takes the product back
  // to draft. It used to stay "active" with nothing to show: the storefront
  // could not render it, and the panel still listed it as live.
  let unpublished = false;
  if (images.length === 0) {
    const { count } = await prisma.product.updateMany({
      where: { id: productId, status: "active" },
      data: { status: "draft" },
    });
    unpublished = count > 0;
  }

  revalidateCatalog();
  return NextResponse.json({ images, unpublished });
}
