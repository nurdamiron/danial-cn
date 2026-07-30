# Danial CN

Premium 1:1 luggage replica storefront for Kazakhstan.

- **UI:** Rimowa-inspired minimal design  
- **Languages:** Russian + Kazakh (`/ru`, `/kk`)  
- **Orders:** Cart → WhatsApp  
- **Payment:** Kaspi (in chat)  
- **Delivery:** cargo / avia / express (KZ)  
- **Admin:** `/admin` — products + multi photo upload  

## Quick start

```bash
cd projects/danial-cn
cp .env.example .env
# edit ADMIN_PASSWORD and NEXT_PUBLIC_WHATSAPP_E164

npm install
npm run db:push
npm run db:seed
npm run dev
```

- Store: http://localhost:3000/ru  
- Admin: http://localhost:3000/admin (password from `.env`)  

## Photos

1. **Admin:** open product → upload JPEG/PNG/WebP (multi), set cover  
2. Product cannot be **active** without at least one photo  

## Important

All products are labeled as **1:1 copies / replicas** — not original brands.
