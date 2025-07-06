-- Create vendor bonds table
CREATE TABLE public.vendor_bonds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  bond_amount DECIMAL(10,2) NOT NULL DEFAULT 250.00,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 year'),
  is_active BOOLEAN DEFAULT true,
  payment_txid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor profiles table (extended vendor info)
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  store_name TEXT NOT NULL,
  description TEXT,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  total_sales INTEGER DEFAULT 0,
  successful_orders INTEGER DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  bitcoin_address TEXT,
  wallet_balance DECIMAL(10,8) DEFAULT 0.00000000,
  payout_threshold DECIMAL(10,8) DEFAULT 0.00100000, -- 0.001 BTC = ~$100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id)
);

-- Create product categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_btc DECIMAL(10,8) NOT NULL CHECK (price_btc > 0),
  price_usd DECIMAL(10,2), -- for display purposes
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  images TEXT[], -- array of image URLs
  tags TEXT[],
  shipping_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(user_id),
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_btc DECIMAL(10,8) NOT NULL CHECK (total_btc > 0),
  platform_fee_btc DECIMAL(10,8) NOT NULL DEFAULT 0, -- 5% platform fee
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled')),
  escrow_address TEXT, -- generated escrow address
  payment_txid TEXT,
  shipping_address TEXT, -- encrypted
  tracking_number TEXT,
  dispute_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table (encrypted communications)
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(user_id),
  content TEXT NOT NULL, -- encrypted content
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(user_id),
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trust events table (for AI trust scoring)
CREATE TABLE public.trust_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  event_type TEXT NOT NULL CHECK (event_type IN ('order_completed', 'positive_review', 'negative_review', 'dispute_opened', 'dispute_resolved', 'fast_response', 'slow_response')),
  impact_score INTEGER NOT NULL, -- positive or negative impact
  order_id UUID REFERENCES public.orders(id),
  review_id UUID REFERENCES public.reviews(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vendor_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Vendor bonds: vendors can view their own, admins can view all
CREATE POLICY "Vendors can view their own bonds" ON public.vendor_bonds FOR SELECT USING (vendor_id = auth.uid());
CREATE POLICY "Vendors can insert their own bonds" ON public.vendor_bonds FOR INSERT WITH CHECK (vendor_id = auth.uid());

-- Vendor profiles: public read, vendors can update their own
CREATE POLICY "Anyone can view vendor profiles" ON public.vendor_profiles FOR SELECT USING (true);
CREATE POLICY "Vendors can insert their own profile" ON public.vendor_profiles FOR INSERT WITH CHECK (vendor_id = auth.uid());
CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles FOR UPDATE USING (vendor_id = auth.uid());

-- Categories: public read
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Products: public read, vendors can manage their own
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can insert their own products" ON public.products FOR INSERT WITH CHECK (vendor_id = auth.uid());
CREATE POLICY "Vendors can update their own products" ON public.products FOR UPDATE USING (vendor_id = auth.uid());
CREATE POLICY "Vendors can view their own products" ON public.products FOR SELECT USING (vendor_id = auth.uid());

-- Orders: buyers and vendors can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (buyer_id = auth.uid() OR vendor_id = auth.uid());
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Vendors can update their orders" ON public.orders FOR UPDATE USING (vendor_id = auth.uid());
CREATE POLICY "Buyers can update their orders" ON public.orders FOR UPDATE USING (buyer_id = auth.uid());

-- Messages: users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update messages they sent" ON public.messages FOR UPDATE USING (sender_id = auth.uid());

-- Reviews: public read, buyers can create reviews for their orders
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Trust events: public read (for transparency)
CREATE POLICY "Anyone can view trust events" ON public.trust_events FOR SELECT USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Digital Goods', 'Software, licenses, and digital content'),
('Services', 'Digital and consulting services'),
('Books & Media', 'Books, movies, music, and educational content'),
('Other', 'Miscellaneous items');