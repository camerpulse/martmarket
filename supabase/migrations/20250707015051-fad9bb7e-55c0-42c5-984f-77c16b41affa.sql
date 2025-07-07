-- Create demo vendor profiles
INSERT INTO vendor_profiles (vendor_id, store_name, store_description, trust_score, is_verified, created_at) VALUES
  (gen_random_uuid(), 'CryptoKing', 'Premium electronics and hardware components for crypto enthusiasts', 97, true, now() - interval '2 years'),
  (gen_random_uuid(), 'SatoshiSupply', 'Digital goods, software licenses, and crypto tools', 94, true, now() - interval '18 months'),
  (gen_random_uuid(), 'BitcoinBazaar', 'Books, media, and collectibles from the Bitcoin era', 91, true, now() - interval '1 year'),
  (gen_random_uuid(), 'AnonymousArts', 'Custom artwork, NFTs, and creative digital services', 88, true, now() - interval '10 months'),
  (gen_random_uuid(), 'TechTrader', 'Latest tech gadgets and accessories', 85, false, now() - interval '8 months'),
  (gen_random_uuid(), 'PrivacyPro', 'Security tools, VPN services, and privacy solutions', 92, true, now() - interval '15 months'),
  (gen_random_uuid(), 'SecureStore', 'Encryption tools and security hardware', 89, true, now() - interval '1 year'),
  (gen_random_uuid(), 'BitMerchant', 'General merchandise and popular items', 87, true, now() - interval '6 months');

-- Create demo products for CryptoKing (Electronics)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'ASIC Mining Rig S19 Pro',
  'High-performance Bitcoin mining hardware with 110 TH/s hashrate. Perfect for serious miners.',
  0.15000000,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  5,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'CryptoKing';

INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Hardware Wallet Ledger',
  'Secure cryptocurrency hardware wallet for cold storage. Brand new, sealed package.',
  0.00250000,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  25,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'CryptoKing';

-- Create demo products for SatoshiSupply (Digital Goods)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Premium VPN Service - 1 Year',
  'Anonymous VPN service with Bitcoin payment. No logs, maximum privacy.',
  0.00120000,
  (SELECT id FROM categories WHERE name = 'Digital Goods' LIMIT 1),
  100,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'SatoshiSupply';

INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Trading Bot Software License',
  'Automated Bitcoin trading bot with advanced algorithms. 30-day license.',
  0.00450000,
  (SELECT id FROM categories WHERE name = 'Digital Goods' LIMIT 1),
  50,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'SatoshiSupply';

-- Create demo products for BitcoinBazaar (Books & Media)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'The Bitcoin Standard - Digital Copy',
  'Classic book about Bitcoin economics and monetary theory. PDF format.',
  0.00035000,
  (SELECT id FROM categories WHERE name = 'Books & Media' LIMIT 1),
  200,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'BitcoinBazaar';

INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Rare Bitcoin Collectible Coin',
  'Physical Bitcoin commemorative coin from 2017. Limited edition collectible.',
  0.00850000,
  (SELECT id FROM categories WHERE name = 'Other' LIMIT 1),
  8,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'BitcoinBazaar';

-- Create demo products for AnonymousArts (Services)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Custom Bitcoin Art NFT',
  'Personalized Bitcoin-themed digital artwork as NFT. Commission includes 3 revisions.',
  0.00180000,
  (SELECT id FROM categories WHERE name = 'Services' LIMIT 1),
  20,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'AnonymousArts';

-- Create demo products for TechTrader (Electronics)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'USB Bitcoin Node Device',
  'Plug-and-play Bitcoin full node device. Easy setup, runs 24/7.',
  0.00320000,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  15,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'TechTrader';

-- Create demo products for PrivacyPro (Services)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Anonymous Email Service - 1 Year',
  'Encrypted email service with Bitcoin payments. No personal information required.',
  0.00095000,
  (SELECT id FROM categories WHERE name = 'Services' LIMIT 1),
  75,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'PrivacyPro';

-- Create demo products for SecureStore (Electronics)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Encrypted USB Drive 256GB',
  'Military-grade encrypted USB drive. Hardware encryption, tamper-proof.',
  0.00275000,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  30,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'SecureStore';

-- Create demo products for BitMerchant (Various)
INSERT INTO products (vendor_id, title, description, price_btc, category_id, stock_quantity, is_active, created_at) 
SELECT 
  vp.vendor_id,
  'Bitcoin Hoodie - Limited Edition',
  'Premium quality hoodie with Bitcoin logo. Size M, L, XL available.',
  0.00125000,
  (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1),
  40,
  true,
  now()
FROM vendor_profiles vp WHERE vp.store_name = 'BitMerchant';