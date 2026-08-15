# Danial CN

Premium luggage storefront for Kazakhstan.

- **UI:** Rimowa-inspired minimal design  
- **Languages:** Russian + Kazakh (`/ru`, `/kk`)  
- **Orders:** Cart → WhatsApp  
- **Payment:** Kaspi (in chat)  
- **Delivery:** cargo / avia / express (KZ)  
- **Auth:** registration + login, roles `USER` (default) / `ADMIN` (single)  
- **Admin:** full CRUD — products, variants, photos, users, settings  

## Quick start

```bash
cd projects/danial-cn
cp .env.example .env
# AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, WhatsApp, Instagram

npm install
npm run db:push
npm run db:seed
npm run dev
```

| URL | |
|-----|--|
| Store | http://localhost:3000/ru |
| Login | http://localhost:3000/admin/login |
| Register | http://localhost:3000/admin/register |

### Default admin

| Field | Value |
|-------|--------|
| Email | `admin@danial.cn` (`ADMIN_EMAIL`) |
| Password | `ADMIN_PASSWORD` from `.env` |

Change `ADMIN_PASSWORD` and `AUTH_SECRET` before the site is reachable by
anyone else — `AUTH_SECRET` signs the session cookies.

## Full admin CRUD

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| **Products** | ✓ | list + search/filter | fields, status, featured | ✓ |
| **Variants** | ✓ color×size | list | SKU, hex, stock, price | ✓ |
| **Photos** | multi-upload | gallery | cover, colorKey, order | ✓ |
| **Users** | admin form / register | list | name, phone, role, password | ✓ |
| **Settings** | seed | ✓ | WhatsApp, delivery, Kaspi | — |
| **Profile** | — | ✓ | name, phone, password | — |

### Product page sections (`/admin/products/[id]`)

1. Product fields (Update)  
2. Variants CRUD (color hex + stock)  
3. Photos CRUD (bind photo → colorKey for storefront gallery)  

## Where data lives

Two independent stores, on purpose:

| | Source | Why |
|---|---|---|
| **Catalog** | `src/data/static-products.json` | Catalog pages stay static — no query per page view |
| **Accounts** | SQLite locally, **Turso** in production | Sign-in needs durable writes |

`hasDatabase()` in `src/lib/db-config.ts` decides whether accounts are
available; it checks the database, not the hosting platform.

### Production database (Turso)

Turso speaks the same SQLite dialect, so the schema, the seed and every query
are identical — only the connection changes.

```bash
brew install tursodatabase/tap/turso    # or: npm i -g @tursodatabase/turso-cli
turso auth signup
turso db create danial-cn

turso db show danial-cn --url           # → TURSO_DATABASE_URL
turso db tokens create danial-cn        # → TURSO_AUTH_TOKEN
```

Add both to **Vercel → Settings → Environment Variables**, along with a real
`AUTH_SECRET` (`openssl rand -base64 48`), then create the tables and the admin
account once:

```bash
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="ey..."
npm run db:push:turso    # creates the tables over libSQL
npm run db:seed          # prints which database it wrote to
```

`db:push` is the local-file command — the Prisma schema engine only speaks
`file:`, so pointing it at a `libsql://` URL writes to `prisma/dev.db` and
leaves production without tables. `db:push:turso` generates the same SQL and
runs it over the libSQL connection instead.

Without these variables the storefront still runs; sign-in returns a 503 that
says the database is missing.

### Publish catalog changes

The storefront reads exported JSON, so product and settings edits are made in a
local run and shipped as a commit:

```bash
npm run dev              # edit in /admin
npm run export:static    # or the "Export → static" button on /admin
git add src/data && git commit -m "chore: export catalog" && git push
```

User accounts are not part of that export — they are edited on the live site at
`/admin/users`.

## Contacts

- WhatsApp: `+7 706 631 6449` (from SiteSettings / env)  
- Instagram: `danial_cn`  
