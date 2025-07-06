-- Insert a test admin user if none exists
DO $$
BEGIN
  -- Insert into admin_profiles if no admin exists
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE is_active = true) THEN
    -- Create a default admin profile (you'll need to manually assign this to a user)
    INSERT INTO public.admin_profiles (user_id, admin_role, is_active, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000', -- Placeholder UUID - replace with actual user ID
      'super_admin',
      true,
      now()
    );
  END IF;
  
  -- Add sample categories if none exist
  IF NOT EXISTS (SELECT 1 FROM public.categories) THEN
    INSERT INTO public.categories (name, description, is_active) VALUES
    ('Electronics', 'Electronic devices and gadgets', true),
    ('Clothing', 'Apparel and fashion items', true),
    ('Books', 'Books and educational materials', true),
    ('Digital Services', 'Digital products and services', true),
    ('Art & Collectibles', 'Artwork and collectible items', true);
  END IF;
END $$;