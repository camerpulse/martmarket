-- COMPREHENSIVE ADMIN PRIVILEGES MIGRATION
-- Grant admins full access to ALL tables and bypass ALL RLS restrictions

-- First, create a comprehensive admin permission function
CREATE OR REPLACE FUNCTION public.is_admin_or_system(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow service role full access
  IF current_setting('role', true) = 'service_role' THEN
    RETURN TRUE;
  END IF;
  
  -- Allow authenticated admins full access
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = COALESCE(user_id_param, auth.uid()) 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant admin bypass policies for ALL tables that don't have them

-- Profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Vendor profiles
DROP POLICY IF EXISTS "Admins can manage all vendor profiles" ON public.vendor_profiles;
CREATE POLICY "Admins can manage all vendor profiles" ON public.vendor_profiles FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Products
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Categories (make manageable by admins)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Bitcoin addresses
DROP POLICY IF EXISTS "Admins can manage all bitcoin addresses" ON public.bitcoin_addresses;
CREATE POLICY "Admins can manage all bitcoin addresses" ON public.bitcoin_addresses FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Bitcoin transactions
DROP POLICY IF EXISTS "Admins can manage all bitcoin transactions" ON public.bitcoin_transactions;
CREATE POLICY "Admins can manage all bitcoin transactions" ON public.bitcoin_transactions FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Wallet balances
DROP POLICY IF EXISTS "Admins can manage all wallet balances" ON public.wallet_balances;
CREATE POLICY "Admins can manage all wallet balances" ON public.wallet_balances FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Disputes
DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
CREATE POLICY "Admins can manage all disputes" ON public.disputes FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Dispute messages
DROP POLICY IF EXISTS "Admins can manage all dispute messages" ON public.dispute_messages;
CREATE POLICY "Admins can manage all dispute messages" ON public.dispute_messages FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Dispute evidence
DROP POLICY IF EXISTS "Admins can manage all dispute evidence" ON public.dispute_evidence;
CREATE POLICY "Admins can manage all dispute evidence" ON public.dispute_evidence FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Forum categories
DROP POLICY IF EXISTS "Admins can manage forum categories" ON public.forum_categories;
CREATE POLICY "Admins can manage forum categories" ON public.forum_categories FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Forum topics
DROP POLICY IF EXISTS "Admins can manage forum topics" ON public.forum_topics;
CREATE POLICY "Admins can manage forum topics" ON public.forum_topics FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Forum replies
DROP POLICY IF EXISTS "Admins can manage forum replies" ON public.forum_replies;
CREATE POLICY "Admins can manage forum replies" ON public.forum_replies FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Forum likes
DROP POLICY IF EXISTS "Admins can manage forum likes" ON public.forum_likes;
CREATE POLICY "Admins can manage forum likes" ON public.forum_likes FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Message threads
DROP POLICY IF EXISTS "Admins can manage all message threads" ON public.message_threads;
CREATE POLICY "Admins can manage all message threads" ON public.message_threads FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Message attachments
DROP POLICY IF EXISTS "Admins can manage all message attachments" ON public.message_attachments;
CREATE POLICY "Admins can manage all message attachments" ON public.message_attachments FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Message reactions
DROP POLICY IF EXISTS "Admins can manage all message reactions" ON public.message_reactions;
CREATE POLICY "Admins can manage all message reactions" ON public.message_reactions FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Message drafts
DROP POLICY IF EXISTS "Admins can manage all message drafts" ON public.message_drafts;
CREATE POLICY "Admins can manage all message drafts" ON public.message_drafts FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Security events
DROP POLICY IF EXISTS "Admins can manage all security events" ON public.security_events;
CREATE POLICY "Admins can manage all security events" ON public.security_events FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Security incidents
DROP POLICY IF EXISTS "Admins can manage all security incidents" ON public.security_incidents;
CREATE POLICY "Admins can manage all security incidents" ON public.security_incidents FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Security settings
DROP POLICY IF EXISTS "Admins can manage all security settings" ON public.security_settings;
CREATE POLICY "Admins can manage all security settings" ON public.security_settings FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- User PGP keys
DROP POLICY IF EXISTS "Admins can manage all user pgp keys" ON public.user_pgp_keys;
CREATE POLICY "Admins can manage all user pgp keys" ON public.user_pgp_keys FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- PGP keys
DROP POLICY IF EXISTS "Admins can manage all pgp keys" ON public.pgp_keys;
CREATE POLICY "Admins can manage all pgp keys" ON public.pgp_keys FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- PGP messages
DROP POLICY IF EXISTS "Admins can manage all pgp messages" ON public.pgp_messages;
CREATE POLICY "Admins can manage all pgp messages" ON public.pgp_messages FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Vendor bonds
DROP POLICY IF EXISTS "Admins can manage all vendor bonds" ON public.vendor_bonds;
CREATE POLICY "Admins can manage all vendor bonds" ON public.vendor_bonds FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Vendor ratings
DROP POLICY IF EXISTS "Admins can manage all vendor ratings" ON public.vendor_ratings;
CREATE POLICY "Admins can manage all vendor ratings" ON public.vendor_ratings FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Product ratings
DROP POLICY IF EXISTS "Admins can manage all product ratings" ON public.product_ratings;
CREATE POLICY "Admins can manage all product ratings" ON public.product_ratings FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Wishlists
DROP POLICY IF EXISTS "Admins can manage all wishlists" ON public.wishlists;
CREATE POLICY "Admins can manage all wishlists" ON public.wishlists FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Trust events
DROP POLICY IF EXISTS "Admins can manage all trust events" ON public.trust_events;
CREATE POLICY "Admins can manage all trust events" ON public.trust_events FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Trust score history
DROP POLICY IF EXISTS "Admins can manage all trust score history" ON public.trust_score_history;
CREATE POLICY "Admins can manage all trust score history" ON public.trust_score_history FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Search history
DROP POLICY IF EXISTS "Admins can manage all search history" ON public.search_history;
CREATE POLICY "Admins can manage all search history" ON public.search_history FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Search analytics
DROP POLICY IF EXISTS "Admins can manage all search analytics" ON public.search_analytics;
CREATE POLICY "Admins can manage all search analytics" ON public.search_analytics FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Translations
DROP POLICY IF EXISTS "Admins can manage all translations" ON public.translations;
CREATE POLICY "Admins can manage all translations" ON public.translations FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Fraud detection rules (make manageable by admins)
DROP POLICY IF EXISTS "Admins can manage fraud rules" ON public.fraud_detection_rules;
CREATE POLICY "Admins can manage fraud rules" ON public.fraud_detection_rules FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- MFA settings
DROP POLICY IF EXISTS "Admins can manage all mfa settings" ON public.mfa_settings;
CREATE POLICY "Admins can manage all mfa settings" ON public.mfa_settings FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- User sessions
DROP POLICY IF EXISTS "Admins can manage all user sessions" ON public.user_sessions;
CREATE POLICY "Admins can manage all user sessions" ON public.user_sessions FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- User bans
DROP POLICY IF EXISTS "Admins can manage all user bans" ON public.user_bans;
CREATE POLICY "Admins can manage all user bans" ON public.user_bans FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Payment confirmations
DROP POLICY IF EXISTS "Admins can manage all payment confirmations" ON public.payment_confirmations;
CREATE POLICY "Admins can manage all payment confirmations" ON public.payment_confirmations FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Bitcoin network fees
DROP POLICY IF EXISTS "Admins can manage bitcoin network fees" ON public.bitcoin_network_fees;
CREATE POLICY "Admins can manage bitcoin network fees" ON public.bitcoin_network_fees FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Escrow transactions
DROP POLICY IF EXISTS "Admins can manage all escrow transactions" ON public.escrow_transactions;
CREATE POLICY "Admins can manage all escrow transactions" ON public.escrow_transactions FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Payment requests
DROP POLICY IF EXISTS "Admins can manage all payment requests" ON public.payment_requests;
CREATE POLICY "Admins can manage all payment requests" ON public.payment_requests FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Product variations
DROP POLICY IF EXISTS "Admins can manage all product variations" ON public.product_variations;
CREATE POLICY "Admins can manage all product variations" ON public.product_variations FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Review helpfulness
DROP POLICY IF EXISTS "Admins can manage all review helpfulness" ON public.review_helpfulness;
CREATE POLICY "Admins can manage all review helpfulness" ON public.review_helpfulness FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Affiliate programs
DROP POLICY IF EXISTS "Admins can manage all affiliate programs" ON public.affiliate_programs;
CREATE POLICY "Admins can manage all affiliate programs" ON public.affiliate_programs FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Affiliate referrals
DROP POLICY IF EXISTS "Admins can manage all affiliate referrals" ON public.affiliate_referrals;
CREATE POLICY "Admins can manage all affiliate referrals" ON public.affiliate_referrals FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Platform testers
DROP POLICY IF EXISTS "Admins can manage all platform testers" ON public.platform_testers;
CREATE POLICY "Admins can manage all platform testers" ON public.platform_testers FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Tester feedback
DROP POLICY IF EXISTS "Admins can manage all tester feedback" ON public.tester_feedback;
CREATE POLICY "Admins can manage all tester feedback" ON public.tester_feedback FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Sample requests
DROP POLICY IF EXISTS "Admins can manage all sample requests" ON public.sample_requests;
CREATE POLICY "Admins can manage all sample requests" ON public.sample_requests FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Search intelligence
DROP POLICY IF EXISTS "Admins can manage all search intelligence" ON public.search_intelligence;
CREATE POLICY "Admins can manage all search intelligence" ON public.search_intelligence FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- System health metrics
DROP POLICY IF EXISTS "Admins can manage all system health metrics" ON public.system_health_metrics;
CREATE POLICY "Admins can manage all system health metrics" ON public.system_health_metrics FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- System config
DROP POLICY IF EXISTS "Admins can manage system config" ON public.system_config;
CREATE POLICY "Admins can manage system config" ON public.system_config FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Typing indicators
DROP POLICY IF EXISTS "Admins can manage all typing indicators" ON public.typing_indicators;
CREATE POLICY "Admins can manage all typing indicators" ON public.typing_indicators FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Content flags
DROP POLICY IF EXISTS "Admins can manage all content flags" ON public.content_flags;
CREATE POLICY "Admins can manage all content flags" ON public.content_flags FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Anonymous feedback (make manageable by admins)
DROP POLICY IF EXISTS "Admins can manage anonymous feedback" ON public.anonymous_feedback;
CREATE POLICY "Admins can manage anonymous feedback" ON public.anonymous_feedback FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- File optimizations
DROP POLICY IF EXISTS "Admins can manage file optimizations" ON public.file_optimizations;
CREATE POLICY "Admins can manage file optimizations" ON public.file_optimizations FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- AI tables - grant admin access
DROP POLICY IF EXISTS "Admins can manage AI conversation memory" ON public.ai_conversation_memory;
CREATE POLICY "Admins can manage AI conversation memory" ON public.ai_conversation_memory FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

DROP POLICY IF EXISTS "Admins can manage AI knowledge base" ON public.ai_knowledge_base;
CREATE POLICY "Admins can manage AI knowledge base" ON public.ai_knowledge_base FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

DROP POLICY IF EXISTS "Admins can manage AI user profiles" ON public.ai_user_profiles;
CREATE POLICY "Admins can manage AI user profiles" ON public.ai_user_profiles FOR ALL 
USING (public.is_admin_or_system()) WITH CHECK (public.is_admin_or_system());

-- Create comprehensive admin logging function
CREATE OR REPLACE FUNCTION public.log_admin_action_comprehensive(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_actions (
    admin_id, action_type, target_type, target_id, details, ip_address, user_agent
  ) VALUES (
    p_admin_id, p_action_type, p_target_type, p_target_id, p_details, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;