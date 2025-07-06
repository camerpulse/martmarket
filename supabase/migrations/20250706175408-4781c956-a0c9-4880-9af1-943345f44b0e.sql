-- Create translations table for multi-language support
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code VARCHAR(5) NOT NULL,
  translation_key VARCHAR(255) NOT NULL,
  translation_value TEXT NOT NULL,
  context VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(language_code, translation_key, context)
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to translations
CREATE POLICY "Translations are publicly readable" 
ON public.translations 
FOR SELECT 
USING (true);

-- Create policy for admin-only write access
CREATE POLICY "Only admins can manage translations" 
ON public.translations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Insert basic translations
INSERT INTO public.translations (language_code, translation_key, translation_value, context) VALUES
-- English translations
('en', 'nav.search', 'Search products, vendors...', NULL),
('en', 'nav.forum', 'Forum', NULL),
('en', 'nav.wishlist', 'Wishlist', NULL),
('en', 'nav.affiliate', 'Affiliate', NULL),
('en', 'nav.orders', 'My Orders', NULL),
('en', 'nav.messages', 'Messages', NULL),
('en', 'nav.profile', 'Profile', NULL),
-- Spanish translations
('es', 'nav.search', 'Buscar productos, vendedores...', NULL),
('es', 'nav.forum', 'Foro', NULL),
('es', 'nav.wishlist', 'Lista de Deseos', NULL),
('es', 'nav.affiliate', 'Afiliado', NULL),
('es', 'nav.orders', 'Mis Pedidos', NULL),
('es', 'nav.messages', 'Mensajes', NULL),
('es', 'nav.profile', 'Perfil', NULL);