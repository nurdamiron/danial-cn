/**
 * What counts as a usable product photo.
 *
 * Kept apart from lib/images.ts, which pulls in sharp and the blob client and
 * so can only ever run on the server. The panel needs the same answer before
 * it uploads anything — a picker that offers files the server will refuse is
 * a trap, and finding out after the wait is worse.
 */

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** For an <input type="file"> accept attribute. */
export const ACCEPT_ATTRIBUTE = ALLOWED_IMAGE_TYPES.join(",");

const MAX_MB = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));

/**
 * Why this file cannot be used, or null when it can.
 *
 * Returns a sentence naming the file rather than a code: it is shown to the
 * person who picked it, usually alongside several others that were fine.
 */
export function imageFileProblem(file: {
  name: string;
  type: string;
  size: number;
}): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `«${file.name}» — не фото. Подойдут JPEG, PNG, WebP и AVIF.`;
  }
  if (file.size === 0) {
    return `«${file.name}» пустой файл.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `«${file.name}» больше ${MAX_MB} МБ.`;
  }
  return null;
}
