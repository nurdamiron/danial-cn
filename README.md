# Danial CN

Premium 1:1 luggage replica storefront for Kazakhstan.

- **UI:** minimal editorial storefront, six house lines
- **Languages:** Russian + Kazakh (`/ru`, `/kk`)
- **Orders:** cart, then WhatsApp
- **Payment:** Kaspi, confirmed in chat
- **Delivery:** cargo, avia or express across KZ
- **Admin:** `/admin`, products and multi photo upload

## Quick start

```bash
cp .env.example .env
# edit ADMIN_PASSWORD and NEXT_PUBLIC_WHATSAPP_E164

npm install
npm run db:push
npm run db:seed
npm run dev
```

- Store: http://localhost:3000/ru
- Admin: http://localhost:3000/admin (password from `.env`)

## Catalog

The catalog has one source of truth, `src/data/static-products.json`. It is
generated, not hand edited:

```bash
node scripts/build-catalog.mjs   # rebuilds the JSON from scripts/build-catalog.mjs
npm run db:seed                  # loads the same JSON into sqlite for local dev
```

Product definitions, colourways, sizes and copy live at the top of
`scripts/build-catalog.mjs`. The builder reads `public/products/<slug>/` and
fails if a product declares a colourway with no photo behind it, so the site
can never advertise a colour that has no image.

Deployments set `USE_STATIC_CATALOG=1` (Vercel does this automatically) and read
the JSON directly. Local dev without that flag reads sqlite through Prisma.

## Photos

Filenames follow `public/products/<slug>/<colorKey>-<n>.jpg`. Every product photo
is 1200 by 1600 and editorial banners are 2400 by 1350.

Two ways to add photos:

1. **Admin:** open a product, upload JPEG/PNG/WebP, set the cover. A product
   cannot go **active** without at least one photo.
2. **Repo:** drop files into `public/products/<slug>/`, add the colourway to
   `scripts/build-catalog.mjs`, then rerun the two commands above.

Provenance and licensing for every shipped image is listed in
`public/CREDITS.md`.

## Logos

`public/brand/*.svg` are real vector files, not markup styled to look like a
logo. The house marks are drawn by `scripts/build-logos.mjs` from a shared
stroke alphabet:

```bash
node scripts/build-logos.mjs
```

`public/brand/pay-kaspi.svg` is the payment provider's own official lockup and
is deliberately **not** produced by that script. `BrandMark` paints monochrome
marks through a CSS mask so one file serves both light and dark surfaces;
its `RATIO` map must match each file's viewBox.

## Copy style

User facing copy avoids em dashes, colons, semicolons, arrows and middot
separators. Write the same idea as separate sentences or with commas.

## Important

All products are labeled as 1 to 1 copies (replicas), not original brands.
