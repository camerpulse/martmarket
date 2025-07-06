-- Create sample categories
INSERT INTO categories (name, description) VALUES 
('Digital Services', 'VPN, software licenses, and digital tools'),
('Hardware', 'Physical devices and equipment'),
('Educational', 'Courses, guides, and learning materials'),
('Software', 'Applications and software products'),
('Digital Goods', 'Art, media, and digital collectibles')
ON CONFLICT (name) DO NOTHING;

-- Create sample vendor profiles for testing (these would normally be created through registration)
INSERT INTO vendor_profiles (vendor_id, store_name, description, trust_score, is_verified, is_featured) VALUES 
('00000000-0000-0000-0000-000000000001', 'PrivacyPro', 'Professional privacy solutions and VPN services', 92, true, true),
('00000000-0000-0000-0000-000000000002', 'CryptoKing', 'Premium hardware and security devices', 97, true, true),
('00000000-0000-0000-0000-000000000003', 'AnonymousArts', 'Digital art and creative collections', 88, true, false),
('00000000-0000-0000-0000-000000000004', 'TechTrader', 'Educational content and tech guides', 85, false, false),
('00000000-0000-0000-0000-000000000005', 'SatoshiSupply', 'Software and application licenses', 94, true, true),
('00000000-0000-0000-0000-000000000006', 'BitcoinBazaar', 'Trading courses and crypto education', 91, true, false)
ON CONFLICT (vendor_id) DO NOTHING;

-- Create sample products
INSERT INTO products (title, description, price_btc, vendor_id, category_id, is_active, is_featured, stock_quantity, shipping_info) 
SELECT 
  p.title,
  p.description,
  p.price_btc,
  p.vendor_id,
  c.id as category_id,
  true as is_active,
  p.is_featured,
  p.stock_quantity,
  p.shipping_info
FROM (VALUES 
  ('Premium VPN Access - 1 Year', 'Anonymous VPN service with global servers', 0.003, '00000000-0000-0000-0000-000000000001', 'Digital Services', true, 100, 'Digital delivery within 24 hours'),
  ('Encrypted USB Drive 128GB', 'Hardware-encrypted USB drive with military-grade security', 0.012, '00000000-0000-0000-0000-000000000002', 'Hardware', true, 50, 'Worldwide shipping, 3-5 business days'),
  ('Digital Art Collection', 'Exclusive NFT-style digital art collection', 0.025, '00000000-0000-0000-0000-000000000003', 'Digital Goods', true, 25, 'Instant digital download'),
  ('Privacy Guide & Tools', 'Complete privacy handbook with tools and techniques', 0.008, '00000000-0000-0000-0000-000000000004', 'Educational', false, 200, 'Digital download'),
  ('Secure Messaging App License', 'End-to-end encrypted messaging application', 0.015, '00000000-0000-0000-0000-000000000005', 'Software', true, 75, 'License key delivered instantly'),
  ('Cryptocurrency Trading Course', 'Professional trading course with live sessions', 0.05, '00000000-0000-0000-0000-000000000006', 'Educational', true, 30, 'Online access provided within 1 hour')
) AS p(title, description, price_btc, vendor_id, category_name, is_featured, stock_quantity, shipping_info)
JOIN categories c ON c.name = p.category_name
ON CONFLICT DO NOTHING;