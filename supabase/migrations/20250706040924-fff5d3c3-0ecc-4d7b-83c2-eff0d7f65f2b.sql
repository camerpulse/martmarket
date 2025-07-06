-- Create sample products using existing vendor
INSERT INTO products (title, description, price_btc, vendor_id, category_id, is_active, is_featured, stock_quantity, shipping_info) 
SELECT 
  p.title,
  p.description,
  p.price_btc,
  '465d3389-b658-46dd-9e41-97fbf160d345' as vendor_id, -- Using existing vendor
  c.id as category_id,
  true as is_active,
  p.is_featured,
  p.stock_quantity,
  p.shipping_info
FROM (VALUES 
  ('Premium VPN Access - 1 Year', 'Anonymous VPN service with global servers and no-log policy', 0.003, 'Digital Services', true, 100, 'Digital delivery within 24 hours'),
  ('Encrypted USB Drive 128GB', 'Hardware-encrypted USB drive with military-grade security', 0.012, 'Electronics', true, 50, 'Worldwide shipping, 3-5 business days'),
  ('Digital Art Collection', 'Exclusive digital art collection with authenticity certificates', 0.025, 'Digital Goods', true, 25, 'Instant digital download'),
  ('Privacy Guide & Tools', 'Complete privacy handbook with tools and techniques', 0.008, 'Books & Media', false, 200, 'Digital download'),
  ('Secure Messaging App License', 'End-to-end encrypted messaging application license', 0.015, 'Digital Goods', true, 75, 'License key delivered instantly'),
  ('Cryptocurrency Trading Course', 'Professional crypto trading course with live sessions', 0.05, 'Books & Media', true, 30, 'Online access provided within 1 hour')
) AS p(title, description, price_btc, category_name, is_featured, stock_quantity, shipping_info)
JOIN categories c ON c.name = p.category_name
ON CONFLICT DO NOTHING;