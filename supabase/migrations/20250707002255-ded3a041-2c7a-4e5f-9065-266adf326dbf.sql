-- Create PGP keys storage table
CREATE TABLE public.user_pgp_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT, -- AES-256 encrypted private key (optional)
  key_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_default BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.user_pgp_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own PGP keys"
ON public.user_pgp_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PGP keys"
ON public.user_pgp_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PGP keys"
ON public.user_pgp_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PGP keys"
ON public.user_pgp_keys FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_pgp_keys_user_id ON public.user_pgp_keys(user_id);
CREATE INDEX idx_user_pgp_keys_fingerprint ON public.user_pgp_keys(key_fingerprint);

-- Create trigger for updated_at
CREATE TRIGGER update_user_pgp_keys_updated_at
  BEFORE UPDATE ON public.user_pgp_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();