BEGIN;
INSERT INTO products(id,name,category,description,price,image_url,label) VALUES
('11111111-1111-4111-8111-111111111111','Essential Cotton Tee','Atasan','Kaos katun premium, nyaman untuk setiap hari.',189000,'/products/tee.jpg','BEST SELLER'),
('22222222-2222-4222-8222-222222222222','Linen Blend Shirt','Atasan','Kemeja linen ringan dengan potongan relaxed.',329000,'/products/shirt.jpg','NEW'),
('33333333-3333-4333-8333-333333333333','Relaxed Wide Pants','Bawahan','Celana potongan lebar dengan siluet modern.',399000,'/products/pants.jpg',NULL),
('44444444-4444-4444-8444-444444444444','Classic Denim Jacket','Outerwear','Jaket denim serbaguna dengan nuansa vintage.',599000,'/products/jacket.jpg','POPULAR'),
('55555555-5555-4555-8555-555555555555','Everyday Midi Dress','Dress','Midi dress elegan untuk aktivitas santai.',459000,'/products/dress.jpg','NEW'),
('66666666-6666-4666-8666-666666666666','Minimal Canvas Tote','Aksesori','Tas kanvas minimalis untuk kebutuhan harian.',149000,'/products/tote.jpg',NULL),
('77777777-7777-4777-8777-777777777777','Ribbed Knit Cardigan','Outerwear','Cardigan rajut lembut untuk layering.',489000,'/products/cardigan.jpg',NULL),
('88888888-8888-4888-8888-888888888888','Tailored Pleated Shorts','Bawahan','Celana pendek dengan detail lipit refined.',279000,'/products/shorts.jpg',NULL)
ON CONFLICT(id) DO NOTHING;
INSERT INTO product_variants(product_id,size,stock)
SELECT p.id,s.size,12 FROM products p CROSS JOIN (VALUES ('S'),('M'),('L'),('XL')) s(size)
WHERE p.id IN ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555','66666666-6666-4666-8666-666666666666','77777777-7777-4777-8777-777777777777','88888888-8888-4888-8888-888888888888')
ON CONFLICT(product_id,size) DO NOTHING;
COMMIT;
