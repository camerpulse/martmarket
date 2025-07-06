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

-- Simple policies first
CREATE POLICY "Enable all access for authenticated users" 
ON public.vendor_profiles FOR ALL
USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();