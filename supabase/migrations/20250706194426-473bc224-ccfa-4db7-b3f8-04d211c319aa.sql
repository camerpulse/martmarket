-- Create PGP keys table for storing user PGP key pairs
CREATE TABLE public.pgp_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT, -- Encrypted with user's password/passphrase
  key_fingerprint TEXT NOT NULL,
  key_type VARCHAR(50) DEFAULT 'RSA-2048',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.pgp_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for PGP keys
CREATE POLICY "Users can view their own PGP keys" 
ON public.pgp_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PGP keys" 
ON public.pgp_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PGP keys" 
ON public.pgp_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PGP keys" 
ON public.pgp_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create PGP messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pgp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  message_hash TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS for messages
ALTER TABLE public.pgp_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for PGP messages
CREATE POLICY "Users can view their own PGP messages" 
ON public.pgp_messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create PGP messages" 
ON public.pgp_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
ON public.pgp_messages 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pgp_keys_updated_at
BEFORE UPDATE ON public.pgp_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-generate PGP keys for new users
CREATE OR REPLACE FUNCTION public.auto_generate_pgp_keys()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by the client-side after user signup
  -- We'll handle the actual key generation in the application
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add MFA settings table for PGP settings if not exists
CREATE TABLE IF NOT EXISTS public.mfa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_pgp_enabled BOOLEAN DEFAULT false,
  pgp_public_key TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for MFA settings
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for MFA settings
CREATE POLICY "Users can view their own MFA settings" 
ON public.mfa_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own MFA settings" 
ON public.mfa_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA settings" 
ON public.mfa_settings 
FOR UPDATE 
USING (auth.uid() = user_id);