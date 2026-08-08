/**
 * Draws the house logos as real vector files into public/brand.
 *
 * The wordmarks are built from a stroke alphabet on a shared 100-unit cap
 * height, so every line reads as part of one family instead of being page
 * text styled to look like a logo. Run with `node scripts/build-logos.mjs`
 * after editing anything here.
 */
import fs from "fs/promises";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public", "brands");

const CAP = 100;
const SW = 9; // stroke width
const I = SW / 2; // inset so strokes never clip the box

/** Stroke alphabet. Each glyph is { w, d } on a 0..w by 0..CAP box. */
const GLYPHS = {
  A: { w: 68, d: [`M${I} ${CAP - I}L34 ${I}L${68 - I} ${CAP - I}`, "M17 64H51"] },
  B: {
    w: 62,
    d: [
      `M6 ${I}V${CAP - I}`,
      `M6 ${I}H34C51 ${I} 51 50 34 50H6`,
      `M6 50H38C55 50 55 ${CAP - I} 38 ${CAP - I}H6`,
    ],
  },
  C: { w: 68, d: [`M58 20A30 45 0 1 0 58 80`] },
  D: { w: 66, d: [`M6 ${I}V${CAP - I}`, `M6 ${I}H28A32 45.5 0 0 1 28 ${CAP - I}H6`] },
  E: { w: 58, d: [`M6 ${I}V${CAP - I}`, `M6 ${I}H54`, "M6 50H45", `M6 ${CAP - I}H54`] },
  G: {
    w: 72,
    d: [`M62 22A30 45 0 1 0 62 78V54`, "M44 54H66"],
  },
  I: { w: 12, d: [`M6 ${I}V${CAP - I}`] },
  K: { w: 64, d: [`M6 ${I}V${CAP - I}`, `M60 ${I}L12 52`, `M28 36L62 ${CAP - I}`] },
  L: { w: 54, d: [`M6 ${I}V${CAP - I}H52`] },
  M: { w: 84, d: [`M6 ${CAP - I}V${I}L42 64L78 ${I}V${CAP - I}`] },
  N: { w: 70, d: [`M6 ${CAP - I}V${I}L64 ${CAP - I}V${I}`] },
  O: { w: 72, d: [`M36 ${I}A30 45.5 0 1 1 35.9 ${I}`] },
  P: { w: 60, d: [`M6 ${CAP - I}V${I}`, `M6 ${I}H32C52 ${I} 52 54 32 54H6`] },
  R: { w: 64, d: [`M6 ${CAP - I}V${I}`, `M6 ${I}H34C52 ${I} 52 52 34 52H6`, `M32 52L60 ${CAP - I}`] },
  S: {
    w: 62,
    d: [`M55 24C55 ${I} 7 ${I} 7 27C7 47 55 47 55 71C55 ${CAP - I} 7 ${CAP - I} 7 74`],
  },
  T: { w: 62, d: [`M4 ${I}H58`, `M31 ${I}V${CAP - I}`] },
  U: { w: 66, d: [`M6 ${I}V64A27 31 0 0 0 60 64V${I}`] },
  V: { w: 68, d: [`M${I} ${I}L34 ${CAP - I}L${68 - I} ${I}`] },
  X: { w: 66, d: [`M${I} ${I}L${66 - I} ${CAP - I}`, `M${66 - I} ${I}L${I} ${CAP - I}`] },
};

const TRACKING = 18;

function wordmark(word, x0 = 0) {
  let x = x0;
  const parts = [];
  for (const ch of word.toUpperCase()) {
    if (ch === " ") {
      x += 34;
      continue;
    }
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for "${ch}" (word: ${word})`);
    parts.push(`<path d="${g.d.join(" ")}" transform="translate(${x} 0)"/>`);
    x += g.w + TRACKING;
  }
  return { svg: parts.join(""), width: x - TRACKING - x0 };
}

/** Brand symbols. Each is drawn inside a 100 by 100 box. */
const SYMBOLS = {
  // ribbed shell, the aluminium groove pattern
  aluma: `<rect x="14" y="8" width="72" height="84" rx="12"/><path d="M32 20v60M50 20v60M68 20v60"/>`,
  // orbit ring
  orbit: `<circle cx="50" cy="50" r="40"/><ellipse cx="50" cy="50" rx="40" ry="16"/>`,
  // vector chevrons
  vecta: `<path d="M18 22l32 28 32-28M18 52l32 28 32-28"/>`,
  // stacked strata
  strata: `<path d="M10 34L50 14l40 20-40 20zM10 58l40 20 40-20M10 76l40 20 40-20"/>`,
  // compass diamond
  nomad: `<path d="M50 6l44 44-44 44L6 50z"/><path d="M50 30l20 20-20 20-20-20z"/>`,
  // meridian globe
  atlas: `<circle cx="50" cy="50" r="42"/><ellipse cx="50" cy="50" rx="18" ry="42"/><path d="M9 36h82M9 64h82"/>`,
  // ribbed case, the house mark
  house: `<rect x="10" y="16" width="80" height="68" rx="10"/><path d="M30 16v68M50 16v68M70 16v68"/><path d="M38 16V8h24v8"/>`,
};

function lockup({ symbol, word, gap = 34, color = "currentColor" }) {
  const mark = SYMBOLS[symbol];
  const symW = mark ? 100 : 0;
  const x0 = mark ? symW + gap : 0;
  const { svg, width } = wordmark(word, x0);
  const total = x0 + width;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${CAP}" fill="none" stroke="${color}" stroke-width="${SW}" stroke-linecap="square" stroke-linejoin="miter" role="img" aria-label="${word}">${
    mark ? `<g>${mark}</g>` : ""
  }${svg}</svg>`;
}

function markOnly(symbol, color = "currentColor") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="${SW}" stroke-linecap="square" stroke-linejoin="miter" role="img">${SYMBOLS[symbol]}</svg>`;
}

const FILES = {
  "danial-cn.svg": lockup({ symbol: "house", word: "DANIAL CN" }),
  "danial-cn-mark.svg": markOnly("house"),
  "aluma.svg": lockup({ symbol: "aluma", word: "ALUMA" }),
  "orbit.svg": lockup({ symbol: "orbit", word: "ORBIT" }),
  "vecta.svg": lockup({ symbol: "vecta", word: "VECTA" }),
  "strata.svg": lockup({ symbol: "strata", word: "STRATA" }),
  "nomad.svg": lockup({ symbol: "nomad", word: "NOMAD" }),
  "atlas.svg": lockup({ symbol: "atlas", word: "ATLAS" }),
  // public/brands/pay-kaspi.svg is the payment provider's own official lockup,
  // not generated here. Do not add it to this map or it will be overwritten.
};

await fs.mkdir(OUT_DIR, { recursive: true });
for (const [name, svg] of Object.entries(FILES)) {
  await fs.writeFile(path.join(OUT_DIR, name), `${svg}\n`, "utf8");
  console.log(`wrote public/brands/${name}  ${svg.length}b`);
}
