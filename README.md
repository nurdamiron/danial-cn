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

### Publish to Vercel

On Vercel the store uses **static JSON** (no writable SQLite).

```bash
# after local admin changes:
npm run export:static
# or button "Export → static" on /admin
git add src/data && git commit -m "chore: export catalog" && git push
```

## Contacts

- WhatsApp: `+7 706 631 6449` (from SiteSettings / env)  
- Instagram: `danial_cn`  
