import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 2400;

export function validateImageFile(file: { type: string; size: number }): void {
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    throw new Error("Invalid image type. Allowed: JPEG, PNG, WebP");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image too large. Max 8 MB");
  }
}

export async function processAndSaveImage(params: {
  productId: string;
  buffer: Buffer;
  originalName: string;
}): Promise<{ url: string; width: number; height: number }> {
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    params.productId,
  );
  await fs.mkdir(dir, { recursive: true });

  const id = randomUUID();
  const filename = `${id}.webp`;
  const absPath = path.join(dir, filename);

  const image = sharp(params.buffer).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const maxDim = Math.max(width, height);

  let pipeline = image.webp({ quality: 82 });
  if (maxDim > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const out = await pipeline.toBuffer({ resolveWithObject: true });
  await fs.writeFile(absPath, out.data);

  return {
    url: `/uploads/products/${params.productId}/${filename}`,
    width: out.info.width,
    height: out.info.height,
  };
}

export async function deleteImageFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/products/")) return;
  const abs = path.join(process.cwd(), "public", url);
  try {
    await fs.unlink(abs);
  } catch {
    // ignore missing file
  }
}
