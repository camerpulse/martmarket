-- Add ban-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean DEFAULT false,
ADD COLUMN ban_reason text,
ADD COLUMN banned_at timestamp with time zone,
ADD COLUMN banned_by uuid;

-- Create user_bans table for ban history
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banned_by uuid NOT NULL,
  ban_reason text NOT NULL,
  banned_at timestamp with time zone DEFAULT now(),
  unbanned_at timestamp with time zone,
  unbanned_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_bans table
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Create policies for user_bans table
CREATE POLICY "Admins can view all user bans" 
ON public.user_bans FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

CREATE POLICY "Admins can manage user bans" 
ON public.user_bans FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_bans_updated_at
  BEFORE UPDATE ON public.user_bans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create vendor_profiles table
CREATE TABLE public.vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
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

-- Enable RLS on vendor_profiles
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_profiles
CREATE POLICY "Users can view approved vendor profiles" 
ON public.vendor_profiles FOR SELECT
USING (true);

CREATE POLICY "Vendors can view their own profile" 
ON public.vendor_profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Vendors can update their own profile" 
ON public.vendor_profiles FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Vendors can create their own profile" 
ON public.vendor_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendor profiles" 
ON public.vendor_profiles FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_profiles ap 
  WHERE ap.user_id = auth.uid() AND ap.is_active = true
));

-- Create trigger for updating updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();