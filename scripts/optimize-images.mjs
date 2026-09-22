/**
 * Pre-builds the product photography that the storefront actually serves.
 *
 * Vercel's image optimiser answered every request with 402 once the plan's
 * transformation quota ran out — which on a shop means no photographs at all.
 * These are 775 stills of luggage on white, they never change between builds,
 * and nothing about them needs optimising per request. So they are resized
 * once, here, and served as ordinary static files.
 *
 * WebP only, deliberately: a custom next/image loader returns one URL, so it
 * cannot content-negotiate AVIF. A <picture> with an AVIF source would be
 * smaller again but next/image will not emit one, and a half-built picture
 * element is worse than a file that is already ten times lighter than the PNG.
 *
 * Idempotent: a variant that exists and is newer than its source is skipped,
 * so a second run costs nothing and `predev` stays instant.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

/**
 * libvips does the work on its own threads, so the win here is keeping several
 * encodes in flight rather than waiting on each in turn: serial, the full
 * catalogue took five minutes on one core.
 */
const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length));

async function mapWithConcurrency(items, limit, fn) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await fn(items[index]);
    }
  });
  await Promise.all(workers);
}

const PUBLIC_DIR = path.join(process.cwd(), "public");

/*
  Variants are built into .next/cache, which Vercel restores between builds,
  and copied into public/ afterwards. Building straight into public/ meant
  re-encoding all 3180 of them on every deploy — ten minutes on a two-core
  build machine, for files that had not changed. Copying them is seconds.
*/
const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "image-variants");
const PUBLIC_OUT = path.join(PUBLIC_DIR, "_img");

/**
 * Width ladders, per directory. /brands is SVG — vectors, skipped.
 *
 * Widths the layouts actually ask for, doubled for retina: cart and favourite
 * thumbs ~112px, catalogue cards ~195–360px, gallery ~700px. Editorial
 * photographs run full-bleed and earn one more step.
 *
 * MUST match LADDERS in src/lib/image-loader.ts: the loader runs in the
 * browser and cannot check what exists, so it trusts every width here to be
 * on disk. That is why a ladder is written in full even when the master is
 * smaller than its last step — 43 of them are — rather than skipping the
 * steps that would upscale. Those files simply hold the master's own size.
 */
const LADDERS = {
  products: [200, 400, 700, 1100],
  editorial: [200, 400, 700, 1100, 1600],
};
const QUALITY = 82;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) yield full;
  }
}

/** Path of a variant inside the build cache, relative part reused for public/. */
function variantRelPath(source, width) {
  const rel = path.relative(PUBLIC_DIR, source);
  const dir = path.dirname(rel);
  const base = path.basename(rel).replace(/\.(png|jpe?g)$/i, "");
  return path.join(dir, `${base}-${width}.webp`);
}

function isFresh(out, source) {
  if (!fs.existsSync(out)) return false;
  return fs.statSync(out).mtimeMs >= fs.statSync(source).mtimeMs;
}

async function main() {
  const roots = Object.keys(LADDERS).map((d) => path.join(PUBLIC_DIR, d)).filter((d) =>
    fs.existsSync(d),
  );
  if (roots.length === 0) {
    console.log("no raster source directories — nothing to optimise");
    return;
  }

  const sources = roots.flatMap((root) => [...walk(root)]);
  let written = 0;
  let skipped = 0;
  let bytesIn = 0;
  let bytesOut = 0;

  await mapWithConcurrency(sources, CONCURRENCY, async (source) => {
    bytesIn += fs.statSync(source).size;
    const ladder = LADDERS[path.relative(PUBLIC_DIR, source).split(path.sep)[0]];

    for (const width of ladder) {
      const rel = variantRelPath(source, width);
      const cached = path.join(CACHE_DIR, rel);

      if (isFresh(cached, source)) {
        skipped++;
      } else {
        fs.mkdirSync(path.dirname(cached), { recursive: true });
        await sharp(source)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(cached);
        written++;
      }
      bytesOut += fs.statSync(cached).size;

      const published = path.join(PUBLIC_OUT, rel);
      if (!isFresh(published, cached)) {
        fs.mkdirSync(path.dirname(published), { recursive: true });
        fs.copyFileSync(cached, published);
      }
    }
  });

  // The loader needs to know which variants exist without touching the disk
  // at request time; it reads this list at build time.
  const manifest = {
    ladders: LADDERS,
    generatedAt: new Date().toISOString(),
    sources: sources.length,
    hash: createHash("sha1").update(sources.join("|")).digest("hex").slice(0, 8),
  };
  fs.mkdirSync(PUBLIC_OUT, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_OUT, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(
    `images: ${sources.length} masters → ${written} written, ${skipped} cached · ` +
      `${mb(bytesIn)}MB → ${mb(bytesOut)}MB`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
