-- Create admin profile for the first user
INSERT INTO public.admin_profiles (user_id, admin_role, is_active, created_at)
VALUES ('465d3389-b658-46dd-9e41-97fbf160d345', 'super_admin', true, now());