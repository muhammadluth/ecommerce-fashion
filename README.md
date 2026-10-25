# MODÉ — ECOMERCE FASHION
Next.js 16 (App Router), React 19, TypeScript, PostgreSQL 15.

## Features
- Responsive fashion catalog with PostgreSQL products, price, inventory by size and image assets.
- Combined category, size, maximum-price and text filters, plus sorting.
- Cart stored in browser localStorage; quantity adjustment and size selection.
- Server-side price/stock verification via POST /api/cart. Checkout with mock card/transfer payment, order history in PostgreSQL and printable demo receipt. No real charges.

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

## Dummy checkout
1. For existing databases run `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/migrations/001_dummy_checkout.sql` **against this project database only**. Fresh installs using `scripts/schema.sql` include the same table definitions.
2. Add products to cart, open **LANJUT KE CHECKOUT**, enter name, email, shipping address, select a demo payment method and outcome.
3. **Simulasikan berhasil** saves a paid order and decrements stock transactionally; **Simulasikan gagal** saves a failed order without decrementing stock.
4. On success, **CETAK STRUK** opens the browser print dialog. Receipts prominently say DEMO and are not valid payment proof.
5. The transaction request ID is idempotent; retries do not double-charge or double-reduce stock. Orders are not exposed via public lookup endpoints.

## API
- `GET /api/products` reads live product records and available sizes.
- `POST /api/cart` accepts JSON `{"items":[{"id":"<uuid>","size":"M","quantity":1}]}` and returns server-calculated totals or 409 for unavailable stock.

- `POST /api/checkout` requires `{requestId, items, customer:{name,email,address}, paymentMethod:"demo_card"|"demo_transfer", simulate:"success"|"failure"}`. Returns receipt; failure simulation returns HTTP 402 and a failure receipt.

## Scope and safety
- Example imagery is downloaded into `public/products`; images and prices are illustrative seeded catalog data.
- This demo records orders and adjusts inventory for simulated successful payment; there is **no actual payment integration**, shipping fulfillment, or customer account.
- Port 3000 is used by another service on the host; this app uses 3100.
- No production deployment configuration or public domain has been established.
