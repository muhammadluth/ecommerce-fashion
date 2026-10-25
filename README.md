# MODÉ — ECOMERCE FASHION
Next.js 16 (App Router), React 19, TypeScript, PostgreSQL 15.

## Features
- Responsive fashion catalog with PostgreSQL products, price, inventory by size and image assets.
- Combined category, size, maximum-price and text filters, plus sorting.
- Cart stored in browser localStorage; quantity adjustment and size selection.
- Server-side price/stock verification via POST /api/cart. **No order placement, checkout, or payment yet.**

## Local setup
1. Install Node.js 24+ and run `npm ci`.
2. Create a **dedicated** PostgreSQL database and user. Do not use any unrelated service's database.
3. Copy `.env.example` to `.env.local`, fill a strong password in `DATABASE_URL`. Never commit this file. Port 55432 is dedicated to this application.
4. If using Docker locally, set `POSTGRES_PASSWORD` to the same value and run `docker compose -f compose.dev.yml up -d postgres`. Alternatively point DATABASE_URL to your own dedicated PostgreSQL instance.
5. Initialize only the verified project's database:
   `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/schema.sql`
   `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/seed.sql`
   Use the connection string from your own local environment; Next.js also reads `.env.local`.
6. Run `npm run dev` and visit http://localhost:3100.
7. Run `npm test && npx tsc --noEmit && npm run build`.

## API
- `GET /api/products` reads live product records and available sizes.
- `POST /api/cart` accepts JSON `{"items":[{"id":"<uuid>","size":"M","quantity":1}]}` and returns server-calculated totals or 409 for unavailable stock.

## Scope and safety
- Example imagery is downloaded into `public/products`; images and prices are illustrative seeded catalog data.
- The application does not place orders, reserve stock, collect payments, or require user accounts.
- Port 3000 is used by another service on the host; this app uses 3100.
- No production deployment configuration or public domain has been established.
