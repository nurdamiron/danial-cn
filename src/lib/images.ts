/**
 * Product photography storage.
 *
 * Uploads go to Vercel Blob, not to the filesystem: on Vercel the disk is
 * read-only and is discarded on every deploy, which is why uploading a photo
 * from the admin panel could not work at all before. Photos that shipped with
 * the repository still live under /public/products and are still served from
 * there; both are just URLs by the time the catalogue sees them.
 */
import { del, put } from "@vercel/blob";
import { imageFileProblem } from "@/lib/image-rules";

/**
 * sharp is a native module and it can fail to load — on Vercel it did, for
 * want of the libvips shared object its platform package never declares a
 * dependency on. Loaded here rather than at the top of the file so that only
 * the code that actually resizes a photograph depends on it: reading the
 * gallery is not that code, and it was failing too.
 */
async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch (error) {
    console.error("sharp failed to load", error);
    throw new Error(
      "Обработка фото недоступна на сервере. Сообщите разработчику: sharp не загрузился.",
    );
  }
}

const MAX_EDGE = 2400;

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/**
 * The limits live in lib/image-rules.ts so the panel can apply them before
 * uploading. Two copies of this list would drift, and the copy that drifted
 * would be the one the person picking files is shown.
 */
export function validateImageFile(file: {
  name?: string;
  type: string;
  size: number;
}): void {
  const problem = imageFileProblem({
    name: file.name ?? "файл",
    type: file.type,
    size: file.size,
  });
  if (problem) throw new Error(problem);
}

export async function processAndSaveImage(params: {
  productId: string;
  buffer: Buffer;
  originalName: string;
}): Promise<{ url: string; width: number; height: number }> {
  if (!blobConfigured()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN не задан, загрузка фото недоступна",
    );
  }

  const sharp = await loadSharp();

  // Re-encoded once, on the way in: phone cameras produce 4000 px JPEGs and
  // the shop never displays anything near that. Orientation is baked in first,
  // because the browser will ignore the EXIF tag once it is stripped.
  const image = sharp(params.buffer).rotate();
  const meta = await image.metadata();
  const maxDim = Math.max(meta.width ?? 0, meta.height ?? 0);

  let pipeline = image.webp({ quality: 90 });
  if (maxDim > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: (meta.width ?? 0) >= (meta.height ?? 0) ? MAX_EDGE : undefined,
      height: (meta.height ?? 0) > (meta.width ?? 0) ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const out = await pipeline.toBuffer({ resolveWithObject: true });

  const blob = await put(
    `products/${params.productId}/${Date.now()}.webp`,
    out.data,
    {
      access: "public",
      contentType: "image/webp",
      // Vercel appends a random suffix so a re-upload never overwrites a photo
      // that a live page is still pointing at.
      addRandomSuffix: true,
    },
  );

  return { url: blob.url, width: out.info.width, height: out.info.height };
}

/**
 * Removes an uploaded photo. Photos committed under /public are left alone:
 * they are part of the repository, not of the blob store.
 */
export async function deleteImageFile(url: string): Promise<void> {
  if (!url.startsWith("http")) return;
  if (!blobConfigured()) return;
  try {
    await del(url);
  } catch (error) {
    // A missing blob must not block removing the row that points at it, but a
    // silent catch here is how an upload that never gets cleaned up hides.
    console.error("blob delete failed", url, error);
  }
}
