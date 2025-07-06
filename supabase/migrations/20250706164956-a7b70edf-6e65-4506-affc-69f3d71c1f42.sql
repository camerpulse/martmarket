-- Seed default forum categories
INSERT INTO public.forum_categories (name, description, icon, sort_order) VALUES
('General Discussion', 'General marketplace discussions and questions', '💬', 1),
('Product Reviews', 'Share reviews and experiences with products', '⭐', 2),
('Vendor Support', 'Get help and support from vendors', '🛟', 3),
('Security & Privacy', 'Discuss security best practices and privacy concerns', '🔒', 4),
('Bitcoin & Payments', 'Discuss Bitcoin payments, fees, and technical questions', '₿', 5),
('Marketplace Feedback', 'Suggestions and feedback for improving the platform', '💡', 6),
('Trading Tips', 'Share trading strategies and market insights', '📈', 7),
('Technical Support', 'Get help with technical issues and troubleshooting', '🔧', 8);