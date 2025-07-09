-- Add translations for ALL remaining pages that are missing translations
INSERT INTO public.translations (language_code, translation_key, translation_value, context) VALUES

-- FAQ Page translations
('en', 'faq.title', 'Frequently Asked Questions', 'faq'),
('en', 'faq.subtitle', 'Find answers to common questions about OpesMarket', 'faq'),

-- Forum Page translations
('en', 'forum.title', 'Community Forum', 'forum'),
('en', 'forum.subtitle', 'Connect with other users and vendors', 'forum'),

-- Vendor Registration translations
('en', 'vendor_registration.title', 'Become a Verified Vendor', 'vendor'),
('en', 'vendor_registration.subtitle', 'Join our trusted marketplace', 'vendor'),

-- Profile translations
('en', 'profile.title', 'My Profile', 'profile'),
('en', 'profile.settings', 'Profile Settings', 'profile'),

-- Notifications translations
('en', 'notifications.title', 'Notifications', 'notifications'),
('en', 'notifications.subtitle', 'Stay updated with your marketplace activity', 'notifications'),

-- Orders translations
('en', 'orders.title', 'My Orders', 'orders'),
('en', 'orders.subtitle', 'Track your order history and status', 'orders'),

-- Security translations
('en', 'security.title', 'Security Settings', 'security'),
('en', 'security.subtitle', 'Manage your account security', 'security'),

-- Wishlist translations
('en', 'wishlist.title', 'My Wishlist', 'wishlist'),
('en', 'wishlist.subtitle', 'Save products for later', 'wishlist'),

-- Cart translations
('en', 'cart.title', 'Shopping Cart', 'cart'),
('en', 'cart.subtitle', 'Review your selected items', 'cart'),

-- PGP Tools translations
('en', 'pgp.title', 'PGP Encryption Tools', 'pgp'),
('en', 'pgp.subtitle', 'Secure communication tools', 'pgp'),

-- Disputes translations
('en', 'disputes.title', 'Order Disputes', 'disputes'),
('en', 'disputes.subtitle', 'Manage order disputes and resolutions', 'disputes'),

-- Vendor Dashboard translations
('en', 'vendor_dashboard.title', 'Vendor Dashboard', 'vendor'),
('en', 'vendor_dashboard.subtitle', 'Manage your store and products', 'vendor'),

-- Admin Dashboard translations
('en', 'admin_dashboard.title', 'Admin Dashboard', 'admin'),
('en', 'admin_dashboard.subtitle', 'Manage the marketplace', 'admin'),

-- Safety and Terms translations
('en', 'safety.title', 'Safety & Terms', 'safety'),
('en', 'safety.subtitle', 'Important safety information and terms of service', 'safety'),

-- How to Order translations
('en', 'how_to_order.title', 'How to Order', 'guide'),
('en', 'how_to_order.subtitle', 'Step-by-step ordering guide', 'guide'),

-- Selling Guide translations
('en', 'selling_guide.title', 'Selling Guide', 'guide'),
('en', 'selling_guide.subtitle', 'Learn how to sell on OpesMarket', 'guide'),

-- Escrow Security translations
('en', 'escrow.title', 'Escrow Security', 'escrow'),
('en', 'escrow.subtitle', 'Understanding our secure escrow system', 'escrow'),

-- Messages translations
('en', 'messages.title', 'Messages', 'messages'),
('en', 'messages.subtitle', 'Secure encrypted messaging', 'messages'),

-- Not Found page translations
('en', 'not_found.title', 'Page Not Found', 'error'),
('en', 'not_found.subtitle', 'The page you are looking for does not exist', 'error'),
('en', 'not_found.go_home', 'Go to Homepage', 'error'),

-- Affiliate translations
('en', 'affiliate.title', 'Affiliate Program', 'affiliate'),
('en', 'affiliate.subtitle', 'Earn commissions by referring new users', 'affiliate'),

-- Product Detail translations
('en', 'product.title', 'Product Details', 'product'),
('en', 'product.add_to_cart', 'Add to Cart', 'product'),
('en', 'product.buy_now', 'Buy Now', 'product'),

-- Common UI translations
('en', 'common.loading', 'Loading...', 'common'),
('en', 'common.error', 'Error', 'common'),
('en', 'common.success', 'Success', 'common'),
('en', 'common.save', 'Save', 'common'),
('en', 'common.cancel', 'Cancel', 'common'),
('en', 'common.delete', 'Delete', 'common'),
('en', 'common.edit', 'Edit', 'common'),
('en', 'common.close', 'Close', 'common'),
('en', 'common.submit', 'Submit', 'common'),
('en', 'common.continue', 'Continue', 'common'),
('en', 'common.back', 'Back', 'common'),
('en', 'common.next', 'Next', 'common'),
('en', 'common.previous', 'Previous', 'common'),
('en', 'common.confirm', 'Confirm', 'common'),
('en', 'common.yes', 'Yes', 'common'),
('en', 'common.no', 'No', 'common')

ON CONFLICT (language_code, translation_key, context) DO UPDATE SET 
  translation_value = EXCLUDED.translation_value;