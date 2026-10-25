BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,category text NOT NULL CHECK(category IN ('Atasan','Bawahan','Outerwear','Dress','Aksesori')),description text NOT NULL DEFAULT '',price integer NOT NULL CHECK(price>=0),image_url text NOT NULL,label text,active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS product_variants (product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,size text NOT NULL CHECK(size IN ('XS','S','M','L','XL','XXL')),stock integer NOT NULL DEFAULT 0 CHECK(stock>=0),PRIMARY KEY(product_id,size));
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(category) WHERE active;
COMMIT;
