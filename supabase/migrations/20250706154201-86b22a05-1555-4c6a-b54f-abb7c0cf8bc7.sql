-- Create vendor_profiles table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  vendor_id uuid NOT NULL,
  business_name text NOT NULL,
  business_description text,
  status text DEFAULT 'pending',
  verification_status text DEFAULT 'pending',
  is_banned boolean DEFAULT false,
  ban_reason text,
  banned_at timestamp with time zone,
  banned_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vendor profile" 
ON public.vendor_profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own vendor profile" 
ON public.vendor_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vendor profile" 
ON public.vendor_profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Vendors can view their profiles by vendor_id" 
ON public.vendor_profiles FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Admins can view all vendor profiles" 
ON public.vendor_profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Admins can update all vendor profiles" 
ON public.vendor_profiles FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();