/**
 * Shrinking a photograph in the browser, before it is uploaded.
 *
 * Vercel refuses a request body over about 4.5 MB, and it refuses it before
 * the route runs: the answer is plain text, not the JSON the panel knows how
 * to read, so a phone photo — routinely 3 to 8 MB — failed with nothing to
 * show for it. Confirmed against production: 4.4 MB came back
 * 413 FUNCTION_PAYLOAD_TOO_LARGE.
 *
 * The server resizes to 2400px anyway, so everything above that was bytes
 * uploaded to be thrown away. Doing it here first makes an 8 MB photo about a
 * megabyte, which also means it arrives over a phone connection in a fraction
 * of the time.
 */

/** The same cap lib/images.ts applies on the server. */
export const UPLOAD_MAX_EDGE = 2400;

/** Anything smaller than this is already small enough to leave alone. */
const SKIP_BELOW_BYTES = 1024 * 1024;

const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.9;

export function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (!longest || longest <= maxEdge) return { width, height };

  const scale = maxEdge / longest;
  return {
    // An extreme panorama would otherwise round its short edge to zero, and a
    // canvas of zero height draws nothing at all.
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * A version of this file small enough to upload.
 *
 * Returns the original when there is nothing to gain or when the browser
 * cannot do it — every failure here is recoverable by just sending what we
 * were given, and a photo that uploads slowly beats one that does not upload.
 */
export async function shrinkForUpload(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    // from-image applies the EXIF rotation phones write instead of turning
    // the pixels, which canvas would otherwise drop on the floor.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const { width, height } = fitWithin(
      bitmap.width,
      bitmap.height,
      UPLOAD_MAX_EDGE,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], renameToJpeg(file.name), {
      type: OUTPUT_TYPE,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}

function renameToJpeg(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") + ".jpg";
}
