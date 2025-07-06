-- Add product variations support
CREATE TABLE public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_name TEXT NOT NULL, -- e.g., "Size", "Color", "Model"
  variation_value TEXT NOT NULL, -- e.g., "Large", "Red", "Pro"
  price_adjustment_btc NUMERIC DEFAULT 0, -- Additional cost for this variation
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product variations
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product variations
CREATE POLICY "Anyone can view product variations"
ON public.product_variations
FOR SELECT
USING (true);

CREATE POLICY "Vendors can manage their product variations"
ON public.product_variations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variations.product_id 
    AND p.vendor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_variations.product_id 
    AND p.vendor_id = auth.uid()
  )
);

-- Add some sample variations for existing products
INSERT INTO public.product_variations (product_id, variation_name, variation_value, price_adjustment_btc, stock_quantity) VALUES
-- Hardware Wallet variations
((SELECT id FROM products WHERE title = 'Premium Bitcoin Hardware Wallet' LIMIT 1), 'Model', 'Standard', 0, 15),
((SELECT id FROM products WHERE title = 'Premium Bitcoin Hardware Wallet' LIMIT 1), 'Model', 'Pro', 0.001, 10),
-- T-Shirt variations
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Size', 'Small', 0, 25),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Size', 'Medium', 0, 35),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Size', 'Large', 0, 25),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Size', 'XL', 0.0001, 15),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Color', 'Black', 0, 50),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Color', 'Orange', 0, 30),
((SELECT id FROM products WHERE title = 'Bitcoin T-Shirt Collection' LIMIT 1), 'Color', 'White', 0, 20),
-- Phone Case variations
((SELECT id FROM products WHERE title = 'Bitcoin Phone Case Collection' LIMIT 1), 'Phone Model', 'iPhone 15', 0, 50),
((SELECT id FROM products WHERE title = 'Bitcoin Phone Case Collection' LIMIT 1), 'Phone Model', 'iPhone 14', 0, 40),
((SELECT id FROM products WHERE title = 'Bitcoin Phone Case Collection' LIMIT 1), 'Phone Model', 'Samsung Galaxy S24', 0, 30),
((SELECT id FROM products WHERE title = 'Bitcoin Phone Case Collection' LIMIT 1), 'Phone Model', 'Google Pixel 8', 0, 25);

-- Create updated_at trigger for product_variations
CREATE TRIGGER update_product_variations_updated_at
    BEFORE UPDATE ON public.product_variations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();