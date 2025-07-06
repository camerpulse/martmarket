-- Phase 4: Admin Dashboard System (Fixed)
-- Create admin management infrastructure

-- Create admin roles and permissions
CREATE TYPE public.admin_role AS ENUM (
  'super_admin',
  'admin', 
  'moderator',
  'support_agent'
);

-- Admin profiles table
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  admin_role public.admin_role NOT NULL DEFAULT 'support_agent',
  permissions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admin actions log for audit trail
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- System metrics for dashboard
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create unique constraint separately
CREATE UNIQUE INDEX idx_system_metrics_unique ON public.system_metrics(metric_name, date(recorded_at));

-- Vendor verification queue
CREATE TABLE public.vendor_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  submitted_documents JSONB,
  verification_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_verifications ENABLE ROW LEVEL SECURITY;

-- Platform settings
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin profiles
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Super admins can manage admin profiles"
ON public.admin_profiles FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.admin_role = 'super_admin' AND ap.is_active = true
));

-- RLS Policies for admin actions
CREATE POLICY "Admins can view admin actions"
ON public.admin_actions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Admins can create admin actions"
ON public.admin_actions FOR INSERT
WITH CHECK (admin_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

-- RLS Policies for system metrics
CREATE POLICY "Admins can view system metrics"
ON public.system_metrics FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "System can manage metrics"
ON public.system_metrics FOR ALL
USING (true);

-- RLS Policies for vendor verifications
CREATE POLICY "Admins can view vendor verifications"
ON public.vendor_verifications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Admins can manage vendor verifications"
ON public.vendor_verifications FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.admin_role IN ('super_admin', 'admin', 'moderator') AND ap.is_active = true
));

-- RLS Policies for platform settings
CREATE POLICY "Admins can view platform settings"
ON public.platform_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Super admins can manage platform settings"
ON public.platform_settings FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.admin_role = 'super_admin' AND ap.is_active = true
));

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = user_id_param AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_actions (
    admin_id, action_type, target_type, target_id, details
  ) VALUES (
    p_admin_id, p_action_type, p_target_type, p_target_id, p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_vendors', (SELECT COUNT(*) FROM public.vendor_profiles),
    'total_products', (SELECT COUNT(*) FROM public.products WHERE is_active = true),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'pending_disputes', (SELECT COUNT(*) FROM public.disputes WHERE status NOT LIKE 'resolved_%'),
    'pending_verifications', (SELECT COUNT(*) FROM public.vendor_verifications WHERE status = 'pending'),
    'total_reviews', (SELECT COUNT(*) FROM public.reviews),
    'platform_revenue_btc', (SELECT COALESCE(SUM(platform_fee_btc), 0) FROM public.orders WHERE status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, description) VALUES
('platform_fee_percentage', '2.5', 'number', 'Platform fee percentage for transactions'),
('max_dispute_days', '30', 'number', 'Maximum days to file a dispute after order completion'),
('vendor_bond_amount', '250.00', 'number', 'Required vendor bond amount in USD'),
('auto_approve_vendors', 'false', 'boolean', 'Automatically approve vendor registrations'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('featured_products_limit', '20', 'number', 'Maximum number of featured products'),
('search_results_per_page', '24', 'number', 'Number of search results per page');

-- Indexes for performance
CREATE INDEX idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_role ON public.admin_profiles(admin_role);
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX idx_vendor_verifications_status ON public.vendor_verifications(status);
CREATE INDEX idx_platform_settings_key ON public.platform_settings(setting_key);