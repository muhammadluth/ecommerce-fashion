-- Additive migration. Apply once to the verified ecommerce-fashion database.
BEGIN;
CREATE TABLE IF NOT EXISTS orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL UNIQUE,
 request_hash text NOT NULL,
 customer_name text NOT NULL,
 customer_email text NOT NULL,
 shipping_address text NOT NULL,
 payment_method text NOT NULL CHECK (payment_method IN ('demo_card','demo_transfer')),
 status text NOT NULL CHECK (status IN ('processing','paid','failed')),
 subtotal integer NOT NULL DEFAULT 0 CHECK (subtotal>=0),
 total integer NOT NULL DEFAULT 0 CHECK (total>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 paid_at timestamptz
);
CREATE TABLE IF NOT EXISTS order_items (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id uuid NOT NULL,
 product_name text NOT NULL,
 size text NOT NULL,
 quantity integer NOT NULL CHECK (quantity>0),
 unit_price integer NOT NULL CHECK (unit_price>=0),
 subtotal integer NOT NULL CHECK (subtotal>=0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
COMMIT;
