/**
 * Points next/image at the WebP variants built by scripts/optimize-images.mjs
 * instead of Vercel's optimiser, which answered 402 — quota spent — and left
 * the shop with no photographs at all.
 *
 * This runs in the browser as well as on the server, so it cannot look at the
 * disk: the widths below must stay in step with WIDTHS in that script. A width
 * is rounded UP to the nearest built variant so an image is never upscaled by
 * the browser; anything past the last step gets the largest one there is.
 */
const LADDERS: Record<string, number[]> = {
  products: [200, 400, 700, 1100],
  editorial: [200, 400, 700, 1100, 1600],
};

export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Admin uploads live on Vercel Blob and are already sized on upload.
  if (/^https?:\/\//.test(src)) return src;

  const ladder = LADDERS[src.split("/")[1]];
  if (!ladder) return src;

  const target = ladder.find((w) => w >= width) ?? ladder[ladder.length - 1];
  const withoutExtension = src.replace(/\.(png|jpe?g)$/i, "");
  return `/_img${withoutExtension}-${target}.webp`;
}
