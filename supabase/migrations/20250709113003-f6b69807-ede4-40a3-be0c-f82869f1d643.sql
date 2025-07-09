-- Ensure all About page translations are properly inserted
INSERT INTO translations (language_code, translation_key, translation_value, context) VALUES
-- Core About page content
('en', 'about.title', 'About OpesMarket', 'about'),
('en', 'about.subtitle', 'The premier AI-powered anonymous marketplace for secure Bitcoin transactions', 'about'),
('en', 'about.mission.title', 'Our Mission', 'about'),
('en', 'about.mission.text', 'OpesMarket is revolutionizing online commerce by providing the world''s most secure, private, and intelligent marketplace. We believe in true digital freedom where privacy is paramount, transactions are transparent, and trust is built through cutting-edge AI technology rather than compromising personal data.', 'about'),

-- Features section
('en', 'about.feature.bitcoin_only', 'Bitcoin-Only', 'about'),
('en', 'about.feature.bitcoin_desc', 'Fully decentralized payments using only Bitcoin, ensuring true financial sovereignty and privacy.', 'about'),
('en', 'about.feature.security', 'Military-Grade Security', 'about'),
('en', 'about.feature.security_desc', 'Advanced encryption, multi-signature escrow, and AI-powered fraud detection protect every transaction.', 'about'),
('en', 'about.feature.privacy', 'Complete Privacy', 'about'),
('en', 'about.feature.privacy_desc', 'Zero personal data collection with anonymous browsing and PGP-encrypted communications.', 'about'),
('en', 'about.feature.community', 'Trusted Community', 'about'),
('en', 'about.feature.community_desc', 'Verified vendors with reputation-based trust scores and transparent community feedback.', 'about'),
('en', 'about.feature.ai', 'AI-Powered Intelligence', 'about'),
('en', 'about.feature.ai_desc', 'Smart recommendations, automated security monitoring, and intelligent dispute resolution.', 'about'),
('en', 'about.feature.global', 'Global Accessibility', 'about'),
('en', 'about.feature.global_desc', 'Available worldwide with multilingual support and seamless cross-border transactions.', 'about'),

-- Values section
('en', 'about.values.title', 'Our Values', 'about'),
('en', 'about.values.privacy', 'Privacy First', 'about'),
('en', 'about.values.privacy_desc', 'Your privacy is non-negotiable. We never collect personal data and ensure complete anonymity.', 'about'),
('en', 'about.values.trust', 'Trust & Safety', 'about'),
('en', 'about.values.trust_desc', 'Building trust through transparency, verified vendors, and AI-powered security measures.', 'about'),
('en', 'about.values.innovation', 'Innovation', 'about'),
('en', 'about.values.innovation_desc', 'Continuously improving with cutting-edge technology and user-centered design.', 'about')

ON CONFLICT (language_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  context = EXCLUDED.context,
  updated_at = now();