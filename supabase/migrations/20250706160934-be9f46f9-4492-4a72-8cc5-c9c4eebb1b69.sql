-- Create wishlist system
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  notes text,
  UNIQUE(user_id, product_id)
);

-- Create file optimization tracking
CREATE TABLE public.file_optimizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_path text NOT NULL,
  optimized_file_path text NOT NULL,
  original_size_bytes bigint NOT NULL,
  optimized_size_bytes bigint NOT NULL,
  compression_ratio numeric,
  format_converted_from text,
  format_converted_to text DEFAULT 'webp',
  optimization_status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now()
);

-- Create trust score history for dynamic visualization
CREATE TABLE public.trust_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  trust_score numeric NOT NULL,
  score_change numeric DEFAULT 0,
  change_reason text,
  contributing_factors jsonb,
  recorded_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist" 
ON public.wishlists FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view public wishlists" 
ON public.wishlists FOR SELECT
USING (true);

-- File optimization policies (system managed)
CREATE POLICY "System can manage file optimizations" 
ON public.file_optimizations FOR ALL
USING (true);

-- Trust score history policies
CREATE POLICY "Anyone can view trust score history" 
ON public.trust_score_history FOR SELECT
USING (true);

CREATE POLICY "System can manage trust score history" 
ON public.trust_score_history FOR ALL
USING (true);

-- Create indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX idx_trust_score_history_vendor_id ON public.trust_score_history(vendor_id);
CREATE INDEX idx_trust_score_history_recorded_at ON public.trust_score_history(recorded_at);
CREATE INDEX idx_file_optimizations_status ON public.file_optimizations(optimization_status);