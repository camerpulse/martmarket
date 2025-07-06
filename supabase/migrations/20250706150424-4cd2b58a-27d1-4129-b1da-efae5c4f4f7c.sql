-- Re-enable RLS and create proper non-recursive policies
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON public.admin_profiles;

-- Create simple policies that don't cause recursion
-- Allow authenticated users to view admin profiles (the application will handle the logic)
CREATE POLICY "Authenticated users can view admin profiles" 
ON public.admin_profiles FOR SELECT
TO authenticated
USING (true);

-- Only allow service role to manage admin profiles (for now)
CREATE POLICY "Service role can manage admin profiles" 
ON public.admin_profiles FOR ALL
TO service_role
USING (true);