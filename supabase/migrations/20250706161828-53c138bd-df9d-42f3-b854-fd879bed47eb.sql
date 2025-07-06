-- Create internal forum system tables

-- Create forum categories
CREATE TABLE public.forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  post_count integer DEFAULT 0,
  last_post_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create forum topics
CREATE TABLE public.forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  last_reply_at timestamp with time zone,
  last_reply_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create forum replies
CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  is_anonymous boolean DEFAULT false,
  reply_to uuid, -- for nested replies
  is_solution boolean DEFAULT false,
  like_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create forum likes
CREATE TABLE public.forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reply_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, reply_id)
);

-- Create anonymous feedback system
CREATE TABLE public.anonymous_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type text NOT NULL, -- 'vendor_review', 'platform_feedback', 'product_review'
  target_id uuid, -- vendor_id, product_id, etc.
  rating integer CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  feedback_tags text[], -- predefined tags for categorization
  sentiment_score numeric, -- AI-calculated sentiment
  is_verified_purchase boolean DEFAULT false,
  ip_hash text, -- for spam prevention
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  trust_impact numeric DEFAULT 0.0
);

-- Create multi-language support
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL, -- 'en', 'es', 'fr', etc.
  translation_key text NOT NULL,
  translation_value text NOT NULL,
  context text, -- for context-specific translations
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(language_code, translation_key, context)
);

-- Create affiliate system
CREATE TABLE public.affiliate_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  commission_rate numeric DEFAULT 0.05, -- 5% default
  total_referrals integer DEFAULT 0,
  total_earnings_btc numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  referral_code text NOT NULL,
  order_id uuid,
  commission_btc numeric,
  status text DEFAULT 'pending', -- 'pending', 'confirmed', 'paid'
  confirmed_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Forum policies
CREATE POLICY "Anyone can view forum categories" 
ON public.forum_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view forum topics" 
ON public.forum_topics FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create topics" 
ON public.forum_topics FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their topics" 
ON public.forum_topics FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum replies" 
ON public.forum_replies FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create replies" 
ON public.forum_replies FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their replies" 
ON public.forum_replies FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can manage their likes" 
ON public.forum_likes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Anonymous feedback policies (public submission)
CREATE POLICY "Anyone can submit anonymous feedback" 
ON public.anonymous_feedback FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can read anonymous feedback" 
ON public.anonymous_feedback FOR SELECT
USING (true);

-- Translation policies
CREATE POLICY "Anyone can view translations" 
ON public.translations FOR SELECT
USING (true);

CREATE POLICY "System can manage translations" 
ON public.translations FOR ALL
USING (true);

-- Affiliate policies
CREATE POLICY "Users can view their affiliate program" 
ON public.affiliate_programs FOR SELECT
USING (auth.uid() = affiliate_id);

CREATE POLICY "Users can create affiliate program" 
ON public.affiliate_programs FOR INSERT
WITH CHECK (auth.uid() = affiliate_id);

CREATE POLICY "Users can update their affiliate program" 
ON public.affiliate_programs FOR UPDATE
USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can view their referrals" 
ON public.affiliate_referrals FOR SELECT
USING (auth.uid() = affiliate_id);

CREATE POLICY "System can manage referrals" 
ON public.affiliate_referrals FOR ALL
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_forum_categories_updated_at
BEFORE UPDATE ON public.forum_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
BEFORE UPDATE ON public.forum_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_programs_updated_at
BEFORE UPDATE ON public.affiliate_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX idx_forum_topics_author_id ON public.forum_topics(author_id);
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_replies_topic_id ON public.forum_replies(topic_id);
CREATE INDEX idx_forum_replies_author_id ON public.forum_replies(author_id);
CREATE INDEX idx_anonymous_feedback_type ON public.anonymous_feedback(feedback_type);
CREATE INDEX idx_anonymous_feedback_target ON public.anonymous_feedback(target_id);
CREATE INDEX idx_translations_language ON public.translations(language_code);
CREATE INDEX idx_affiliate_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_user ON public.affiliate_referrals(referred_user_id);