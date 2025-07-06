-- Fix the recursive RLS policy issue on admin_profiles
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON public.admin_profiles;

-- Create non-recursive policies using the is_admin function
CREATE POLICY "Admins can view admin profiles" 
ON public.admin_profiles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin profiles" 
ON public.admin_profiles FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = auth.uid() 
  AND ap.admin_role = 'super_admin' 
  AND ap.is_active = true
));