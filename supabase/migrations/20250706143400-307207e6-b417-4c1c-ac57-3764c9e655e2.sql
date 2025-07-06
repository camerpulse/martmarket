-- Phase 3: Advanced Search & Filters System
-- Create search and filtering infrastructure

-- Create search history table for analytics
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  search_query TEXT NOT NULL,
  filters_applied JSONB,
  results_count INTEGER DEFAULT 0,
  clicked_product_id UUID,
  search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create search analytics view
CREATE TABLE public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trending_score NUMERIC(5,2) DEFAULT 0
);

-- Enable RLS  
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Add full-text search to products
ALTER TABLE public.products ADD COLUMN search_vector tsvector;

-- Create search index
CREATE INDEX idx_products_search_vector ON public.products USING GIN(search_vector);
CREATE INDEX idx_products_price ON public.products(price_btc);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector updates
CREATE TRIGGER update_products_search_vector
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector();

-- Update existing products
UPDATE public.products SET search_vector = to_tsvector('english', 
  COALESCE(title, '') || ' ' ||
  COALESCE(description, '') || ' ' ||
  COALESCE(array_to_string(tags, ' '), '')
);

-- RLS Policies
CREATE POLICY "Users can view their search history"
ON public.search_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create search history"
ON public.search_history FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view search analytics"
ON public.search_analytics FOR SELECT
USING (true);

CREATE POLICY "System can manage search analytics"
ON public.search_analytics FOR ALL
USING (true);

-- Function to log searches and update analytics
CREATE OR REPLACE FUNCTION public.log_search(
  p_user_id UUID,
  p_search_query TEXT,
  p_filters JSONB DEFAULT NULL,
  p_results_count INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  -- Log individual search
  INSERT INTO public.search_history (
    user_id, search_query, filters_applied, results_count
  ) VALUES (
    p_user_id, p_search_query, p_filters, p_results_count
  );
  
  -- Update search analytics
  INSERT INTO public.search_analytics (search_term, search_count, last_searched)
  VALUES (p_search_query, 1, now())
  ON CONFLICT (search_term) DO UPDATE SET
    search_count = search_analytics.search_count + 1,
    last_searched = now(),
    trending_score = search_analytics.search_count * 0.1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;