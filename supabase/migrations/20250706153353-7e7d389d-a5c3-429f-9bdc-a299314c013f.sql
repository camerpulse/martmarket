-- Add ban-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS banned_by uuid;

-- Create user_bans table for ban history
CREATE TABLE IF NOT EXISTS public.user_bans (
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

-- Enable RLS on user_bans table if not already enabled
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Admins can view all user bans" ON public.user_bans;
DROP POLICY IF EXISTS "Admins can manage user bans" ON public.user_bans;

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

-- Add ban-related columns to vendor_profiles if they don't exist
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS banned_by uuid;