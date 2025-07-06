-- Enhanced Reviews and Rating System
-- Update existing reviews table to add more comprehensive review features
ALTER TABLE public.reviews 
ADD COLUMN product_rating integer CHECK (product_rating >= 1 AND product_rating <= 5),
ADD COLUMN communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
ADD COLUMN shipping_rating integer CHECK (shipping_rating >= 1 AND shipping_rating <= 5),
ADD COLUMN overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
ADD COLUMN would_recommend boolean DEFAULT true,
ADD COLUMN review_title text,
ADD COLUMN helpful_votes integer DEFAULT 0,
ADD COLUMN verified_purchase boolean DEFAULT true,
ADD COLUMN review_images text[],
ADD COLUMN review_status text DEFAULT 'published' CHECK (review_status IN ('pending', 'published', 'flagged', 'removed'));

-- Update the existing rating column to be overall_rating for consistency
UPDATE public.reviews SET overall_rating = rating WHERE overall_rating IS NULL;

-- Create review helpfulness tracking
CREATE TABLE public.review_helpfulness (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    is_helpful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- Enable RLS on review helpfulness
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Create policies for review helpfulness
CREATE POLICY "Users can manage their own helpfulness votes"
ON public.review_helpfulness FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view helpfulness votes"
ON public.review_helpfulness FOR SELECT
USING (true);

-- Create vendor rating aggregates table for performance
CREATE TABLE public.vendor_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid NOT NULL UNIQUE,
    total_reviews integer DEFAULT 0,
    average_overall_rating numeric(3,2) DEFAULT 0,
    average_product_rating numeric(3,2) DEFAULT 0,
    average_communication_rating numeric(3,2) DEFAULT 0,
    average_shipping_rating numeric(3,2) DEFAULT 0,
    five_star_count integer DEFAULT 0,
    four_star_count integer DEFAULT 0,
    three_star_count integer DEFAULT 0,
    two_star_count integer DEFAULT 0,
    one_star_count integer DEFAULT 0,
    recommendation_percentage numeric(5,2) DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on vendor ratings
ALTER TABLE public.vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy for vendor ratings
CREATE POLICY "Anyone can view vendor ratings"
ON public.vendor_ratings FOR SELECT
USING (true);

CREATE POLICY "System can manage vendor ratings"
ON public.vendor_ratings FOR ALL
USING (true);

-- Create product rating aggregates table
CREATE TABLE public.product_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    total_reviews integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    five_star_count integer DEFAULT 0,
    four_star_count integer DEFAULT 0,
    three_star_count integer DEFAULT 0,
    two_star_count integer DEFAULT 0,
    one_star_count integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on product ratings
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy for product ratings
CREATE POLICY "Anyone can view product ratings"
ON public.product_ratings FOR SELECT
USING (true);

CREATE POLICY "System can manage product ratings"
ON public.product_ratings FOR ALL
USING (true);

-- Create function to update rating aggregates
CREATE OR REPLACE FUNCTION update_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vendor ratings
    WITH vendor_stats AS (
        SELECT 
            vendor_id,
            COUNT(*) as total_reviews,
            AVG(overall_rating) as avg_overall,
            AVG(product_rating) as avg_product,
            AVG(communication_rating) as avg_communication,
            AVG(shipping_rating) as avg_shipping,
            COUNT(*) FILTER (WHERE overall_rating = 5) as five_star,
            COUNT(*) FILTER (WHERE overall_rating = 4) as four_star,
            COUNT(*) FILTER (WHERE overall_rating = 3) as three_star,
            COUNT(*) FILTER (WHERE overall_rating = 2) as two_star,
            COUNT(*) FILTER (WHERE overall_rating = 1) as one_star,
            (COUNT(*) FILTER (WHERE would_recommend = true) * 100.0 / COUNT(*)) as rec_pct
        FROM public.reviews 
        WHERE review_status = 'published'
        GROUP BY vendor_id
    )
    INSERT INTO public.vendor_ratings (
        vendor_id, total_reviews, average_overall_rating, average_product_rating,
        average_communication_rating, average_shipping_rating,
        five_star_count, four_star_count, three_star_count, two_star_count, one_star_count,
        recommendation_percentage, updated_at
    )
    SELECT 
        vendor_id, total_reviews, avg_overall, avg_product, avg_communication, avg_shipping,
        five_star, four_star, three_star, two_star, one_star, rec_pct, now()
    FROM vendor_stats
    WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
    ON CONFLICT (vendor_id) DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_overall_rating = EXCLUDED.average_overall_rating,
        average_product_rating = EXCLUDED.average_product_rating,
        average_communication_rating = EXCLUDED.average_communication_rating,
        average_shipping_rating = EXCLUDED.average_shipping_rating,
        five_star_count = EXCLUDED.five_star_count,
        four_star_count = EXCLUDED.four_star_count,
        three_star_count = EXCLUDED.three_star_count,
        two_star_count = EXCLUDED.two_star_count,
        one_star_count = EXCLUDED.one_star_count,
        recommendation_percentage = EXCLUDED.recommendation_percentage,
        updated_at = now();

    -- Update product ratings
    WITH product_stats AS (
        SELECT 
            r.product_id,
            COUNT(*) as total_reviews,
            AVG(r.overall_rating) as avg_rating,
            COUNT(*) FILTER (WHERE r.overall_rating = 5) as five_star,
            COUNT(*) FILTER (WHERE r.overall_rating = 4) as four_star,
            COUNT(*) FILTER (WHERE r.overall_rating = 3) as three_star,
            COUNT(*) FILTER (WHERE r.overall_rating = 2) as two_star,
            COUNT(*) FILTER (WHERE r.overall_rating = 1) as one_star
        FROM public.reviews r
        JOIN public.orders o ON r.order_id = o.id
        WHERE r.review_status = 'published'
        GROUP BY r.product_id
    )
    INSERT INTO public.product_ratings (
        product_id, total_reviews, average_rating,
        five_star_count, four_star_count, three_star_count, two_star_count, one_star_count,
        updated_at
    )
    SELECT 
        product_id, total_reviews, avg_rating,
        five_star, four_star, three_star, two_star, one_star, now()
    FROM product_stats
    WHERE product_id = (SELECT product_id FROM public.orders WHERE id = COALESCE(NEW.order_id, OLD.order_id))
    ON CONFLICT (product_id) DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        five_star_count = EXCLUDED.five_star_count,
        four_star_count = EXCLUDED.four_star_count,
        three_star_count = EXCLUDED.three_star_count,
        two_star_count = EXCLUDED.two_star_count,
        one_star_count = EXCLUDED.one_star_count,
        updated_at = now();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating aggregates
CREATE TRIGGER update_rating_aggregates_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_rating_aggregates();

-- Create indexes for performance
CREATE INDEX idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX idx_reviews_status ON public.reviews(review_status);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_review_helpfulness_review_id ON public.review_helpfulness(review_id);
CREATE INDEX idx_vendor_ratings_vendor_id ON public.vendor_ratings(vendor_id);
CREATE INDEX idx_product_ratings_product_id ON public.product_ratings(product_id);

-- Update existing reviews policies to handle new columns
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;
CREATE POLICY "Buyers can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid() AND review_status = 'published');

-- Add policy for updating review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpfulness_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.reviews 
    SET helpful_votes = (
        SELECT COUNT(*) 
        FROM public.review_helpfulness 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND is_helpful = true
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpfulness count updates
CREATE TRIGGER update_review_helpfulness_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.review_helpfulness
FOR EACH ROW EXECUTE FUNCTION update_review_helpfulness_count();