-- Create product testing system tables

-- Create testers table for platform testers
CREATE TABLE public.platform_testers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tester_status text DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  specialization text[], -- areas of expertise
  reputation_score integer DEFAULT 0,
  samples_received integer DEFAULT 0,
  reports_submitted integer DEFAULT 0,
  quality_rating numeric DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create sample requests table
CREATE TABLE public.sample_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  product_id uuid NOT NULL,
  tester_id uuid,
  status text DEFAULT 'pending', -- 'pending', 'assigned', 'shipped', 'received', 'reviewed', 'completed'
  sample_description text NOT NULL,
  shipping_address text,
  tracking_number text,
  requested_at timestamp with time zone DEFAULT now(),
  assigned_at timestamp with time zone,
  shipped_at timestamp with time zone,
  received_at timestamp with time zone,
  completed_at timestamp with time zone,
  priority_level text DEFAULT 'normal', -- 'low', 'normal', 'high'
  estimated_value_usd numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create tester feedback table
CREATE TABLE public.tester_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_request_id uuid NOT NULL,
  tester_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  product_id uuid NOT NULL,
  authenticity_score integer CHECK (authenticity_score >= 1 AND authenticity_score <= 10),
  quality_score integer CHECK (quality_score >= 1 AND quality_score <= 10),
  packaging_score integer CHECK (packaging_score >= 1 AND packaging_score <= 10),
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 10),
  detailed_review text NOT NULL,
  photos jsonb, -- array of photo URLs
  verified_possession boolean DEFAULT true,
  would_recommend boolean,
  feedback_tags text[], -- 'authentic', 'high_quality', 'fast_shipping', etc.
  impact_on_trust_score numeric DEFAULT 0.0,
  is_published boolean DEFAULT false,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_by uuid, -- admin who reviewed the feedback
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_testers
CREATE POLICY "Testers can view their own profile" 
ON public.platform_testers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can apply to be testers" 
ON public.platform_testers FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Testers can update their profile" 
ON public.platform_testers FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can manage testers" 
ON public.platform_testers FOR ALL
USING (true);

-- Create policies for sample_requests
CREATE POLICY "Vendors can create sample requests" 
ON public.sample_requests FOR INSERT
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can view their sample requests" 
ON public.sample_requests FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Testers can view assigned requests" 
ON public.sample_requests FOR SELECT
USING (tester_id = auth.uid());

CREATE POLICY "Testers can update assigned requests" 
ON public.sample_requests FOR UPDATE
USING (tester_id = auth.uid());

CREATE POLICY "System can manage sample requests" 
ON public.sample_requests FOR ALL
USING (true);

-- Create policies for tester_feedback
CREATE POLICY "Testers can create feedback" 
ON public.tester_feedback FOR INSERT
WITH CHECK (tester_id = auth.uid());

CREATE POLICY "Testers can view their feedback" 
ON public.tester_feedback FOR SELECT
USING (tester_id = auth.uid());

CREATE POLICY "Vendors can view feedback about their products" 
ON public.tester_feedback FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Anyone can view published feedback" 
ON public.tester_feedback FOR SELECT
USING (is_published = true);

CREATE POLICY "System can manage feedback" 
ON public.tester_feedback FOR ALL
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_platform_testers_updated_at
BEFORE UPDATE ON public.platform_testers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sample_requests_updated_at
BEFORE UPDATE ON public.sample_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tester_feedback_updated_at
BEFORE UPDATE ON public.tester_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_platform_testers_user_id ON public.platform_testers(user_id);
CREATE INDEX idx_sample_requests_vendor_id ON public.sample_requests(vendor_id);
CREATE INDEX idx_sample_requests_tester_id ON public.sample_requests(tester_id);
CREATE INDEX idx_sample_requests_status ON public.sample_requests(status);
CREATE INDEX idx_tester_feedback_vendor_id ON public.tester_feedback(vendor_id);
CREATE INDEX idx_tester_feedback_product_id ON public.tester_feedback(product_id);
CREATE INDEX idx_tester_feedback_published ON public.tester_feedback(is_published);