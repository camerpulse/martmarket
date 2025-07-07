-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update the handle_new_user function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Update existing profiles with email from auth.users
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.user_id = auth.users.id;