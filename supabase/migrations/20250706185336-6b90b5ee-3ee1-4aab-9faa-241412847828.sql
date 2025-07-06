-- Add more sample products to make the shop page look beautiful

-- First, let's add some more categories
INSERT INTO public.categories (name, description, is_active) VALUES
('Electronics', 'Digital devices and gadgets', true),
('Books', 'Physical and digital books', true),
('Fashion', 'Clothing and accessories', true),
('Home & Garden', 'Home improvement and gardening supplies', true),
('Sports & Outdoors', 'Sports equipment and outdoor gear', true),
('Health & Beauty', 'Health and beauty products', true),
('Automotive', 'Car parts and accessories', true),
('Toys & Games', 'Toys, games, and collectibles', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products with various prices and details
INSERT INTO public.products (
  title, 
  description, 
  price_btc, 
  stock_quantity, 
  category_id, 
  vendor_id, 
  is_active, 
  is_featured,
  shipping_info,
  tags
) VALUES
('Premium Bitcoin Hardware Wallet', 'Secure cold storage for your Bitcoin with advanced security features', 0.0045, 25, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Ships worldwide in 2-3 days', ARRAY['bitcoin', 'hardware', 'wallet', 'security']),
('Cryptocurrency Trading Guide', 'Complete guide to cryptocurrency trading strategies and market analysis', 0.0012, 50, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Digital download available immediately', ARRAY['trading', 'crypto', 'guide', 'education']),
('Bitcoin T-Shirt Collection', 'Premium quality Bitcoin-themed apparel in various sizes', 0.0008, 100, (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Ships within 5-7 business days', ARRAY['bitcoin', 'clothing', 'apparel', 'fashion']),
('Smart Home Mining Rig', 'Efficient Bitcoin mining setup for home use with low power consumption', 0.085, 5, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Free shipping, setup support included', ARRAY['mining', 'bitcoin', 'hardware', 'smart']),
('Crypto Investment Masterclass', 'Online course covering advanced cryptocurrency investment strategies', 0.0025, 200, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Instant access upon purchase', ARRAY['investment', 'crypto', 'course', 'education']),
('Blockchain Developer Toolkit', 'Complete development tools for blockchain applications', 0.0055, 15, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Digital delivery within 24 hours', ARRAY['blockchain', 'development', 'tools', 'programming']),
('Bitcoin Hodler Mug', 'High-quality ceramic mug with Bitcoin design', 0.0003, 150, (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Ships in 3-5 business days', ARRAY['bitcoin', 'mug', 'hodler', 'ceramic']),
('Cryptocurrency News Subscription', 'Premium crypto news and analysis service', 0.0015, 1000, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Digital subscription activated immediately', ARRAY['news', 'analysis', 'subscription', 'crypto']),
('Bitcoin Gaming Accessories', 'Gaming peripherals with Bitcoin theme', 0.0035, 30, (SELECT id FROM categories WHERE name = 'Toys & Games' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Ships worldwide, 1-2 weeks delivery', ARRAY['gaming', 'bitcoin', 'accessories', 'peripherals']),
('DeFi Protocol Guide', 'Comprehensive guide to decentralized finance protocols', 0.0018, 75, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Digital download available', ARRAY['defi', 'protocol', 'guide', 'finance']),
('Crypto Portfolio Tracker', 'Professional portfolio management software', 0.0028, 40, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'License key delivered instantly', ARRAY['portfolio', 'tracking', 'software', 'crypto']),
('Bitcoin Sticker Pack', 'High-quality vinyl stickers with various Bitcoin designs', 0.0001, 500, (SELECT id FROM categories WHERE name = 'Fashion' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Ships worldwide in 1-2 weeks', ARRAY['stickers', 'bitcoin', 'vinyl', 'design']),
('Cryptocurrency Wallet Comparison', 'Detailed analysis of popular crypto wallets', 0.0008, 120, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'PDF download available', ARRAY['wallet', 'comparison', 'analysis', 'crypto']),
('Bitcoin Art Print Collection', 'Limited edition Bitcoin-themed art prints', 0.0022, 25, (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Shipped with protective packaging', ARRAY['art', 'print', 'bitcoin', 'limited']),
('Crypto Security Audit Tools', 'Professional security tools for blockchain projects', 0.0095, 10, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Digital delivery with documentation', ARRAY['security', 'audit', 'tools', 'blockchain']),
('Lightning Network Guide', 'Complete guide to Bitcoin Lightning Network', 0.0012, 80, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Instant digital download', ARRAY['lightning', 'network', 'bitcoin', 'guide']),
('Crypto Market Analysis Tools', 'Advanced charting and analysis software', 0.0048, 20, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Software license delivered instantly', ARRAY['analysis', 'tools', 'market', 'crypto']),
('Bitcoin Conference Tickets', 'Exclusive access to Bitcoin conferences and events', 0.025, 50, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, true, 'Digital tickets sent via email', ARRAY['conference', 'tickets', 'bitcoin', 'events']),
('Cryptocurrency Mining Guide', 'Step-by-step mining setup and optimization guide', 0.0016, 60, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Digital guide with video tutorials', ARRAY['mining', 'guide', 'cryptocurrency', 'tutorial']),
('Bitcoin Phone Case Collection', 'Protective phone cases with Bitcoin designs', 0.0006, 200, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), (SELECT vendor_id FROM vendor_profiles LIMIT 1), true, false, 'Ships in 2-4 business days', ARRAY['phone', 'case', 'bitcoin', 'protection']);