-- Add comprehensive translations for all pages, footer menu, and missing components
INSERT INTO public.translations (language_code, translation_key, translation_value, context) VALUES

-- Footer menu translations (English)
('en', 'footer.menu.marketplace', 'Marketplace', 'footer'),
('en', 'footer.menu.browse_products', 'Browse Products', 'footer'),
('en', 'footer.menu.verified_vendors', 'Verified Vendors', 'footer'),
('en', 'footer.menu.how_to_order', 'How to Order', 'footer'),
('en', 'footer.menu.selling_guide', 'Selling Guide', 'footer'),
('en', 'footer.menu.escrow_security', 'Escrow Security', 'footer'),
('en', 'footer.menu.categories', 'Categories', 'footer'),
('en', 'footer.menu.support', 'Support', 'footer'),
('en', 'footer.menu.faq', 'FAQ', 'footer'),
('en', 'footer.menu.about_us', 'About Us', 'footer'),
('en', 'footer.menu.contact', 'Contact', 'footer'),
('en', 'footer.menu.forbidden', 'Forbidden in Opes Market', 'footer'),
('en', 'footer.menu.pgp_tools', 'PGP Tools', 'footer'),
('en', 'footer.menu.help_center', 'Help Center', 'footer'),
('en', 'footer.copyright', '© 2025 OpesMarket. All rights reserved. Bitcoin-only anonymous marketplace.', 'footer'),
('en', 'footer.status.secure', 'Secure • Anonymous • AI-Powered', 'footer'),
('en', 'footer.status.online', 'Online', 'footer'),

-- About page translations (English)
('en', 'about.title', 'About OpesMarket', 'about'),
('en', 'about.subtitle', 'The world''s most secure anonymous marketplace, powered by Bitcoin and AI technology.', 'about'),
('en', 'about.mission.title', 'Our Mission', 'about'),
('en', 'about.mission.content', 'OpesMarket is dedicated to creating a secure, anonymous, and trustworthy marketplace where privacy is paramount. We leverage cutting-edge Bitcoin technology and AI-powered security systems to ensure safe transactions while maintaining complete user anonymity.', 'about'),
('en', 'about.features.bitcoin.title', 'Bitcoin Only', 'about'),
('en', 'about.features.bitcoin.desc', 'All transactions are conducted exclusively in Bitcoin, ensuring complete financial privacy and decentralization.', 'about'),
('en', 'about.features.security.title', 'Advanced Security', 'about'),
('en', 'about.features.security.desc', 'Multi-layered security protocols protect all users and transactions from potential threats.', 'about'),
('en', 'about.features.community.title', 'Trusted Community', 'about'),
('en', 'about.features.community.desc', 'Our verified vendor system ensures quality and reliability in every transaction.', 'about'),
('en', 'about.features.ai.title', 'AI-Powered', 'about'),
('en', 'about.features.ai.desc', 'Intelligent algorithms provide fraud detection, trust scoring, and enhanced user experience.', 'about'),
('en', 'about.features.global.title', 'Global Access', 'about'),
('en', 'about.features.global.desc', 'Available worldwide with support for multiple languages and Tor network compatibility.', 'about'),
('en', 'about.features.privacy.title', 'Complete Privacy', 'about'),
('en', 'about.features.privacy.desc', 'End-to-end encryption and anonymous browsing ensure your identity remains protected.', 'about'),

-- Shop page translations (English)
('en', 'shop.title', 'Marketplace', 'shop'),
('en', 'shop.search.placeholder', 'Search products...', 'shop'),
('en', 'shop.filters.category', 'Category', 'shop'),
('en', 'shop.filters.all_categories', 'All Categories', 'shop'),
('en', 'shop.filters.price_range', 'Price Range', 'shop'),
('en', 'shop.filters.all_prices', 'All Prices', 'shop'),
('en', 'shop.filters.sort_by', 'Sort By', 'shop'),
('en', 'shop.filters.newest', 'Newest', 'shop'),
('en', 'shop.filters.price_low', 'Price: Low to High', 'shop'),
('en', 'shop.filters.price_high', 'Price: High to Low', 'shop'),
('en', 'shop.filters.rating', 'Highest Rated', 'shop'),
('en', 'shop.top_vendors.title', 'Top Vendors', 'shop'),
('en', 'shop.trending.title', 'Trending Categories', 'shop'),

-- Common UI translations (English)
('en', 'ui.search', 'Search', 'ui'),
('en', 'ui.filter', 'Filter', 'ui'),
('en', 'ui.clear_filters', 'Clear Filters', 'ui'),
('en', 'ui.no_results', 'No results found', 'ui'),
('en', 'ui.load_more', 'Load More', 'ui'),
('en', 'ui.view_all', 'View All', 'ui')

ON CONFLICT (language_code, translation_key, context) DO NOTHING;