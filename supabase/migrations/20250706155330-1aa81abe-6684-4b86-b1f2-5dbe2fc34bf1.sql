-- Create vendor_bonds table
CREATE TABLE IF NOT EXISTS public.vendor_bonds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  amount_usd numeric NOT NULL DEFAULT 250,
  amount_satoshis bigint,
  bond_type text DEFAULT 'annual',
  status text DEFAULT 'pending',
  payment_address text,
  payment_txid text,
  paid_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_bonds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vendors can view their own bonds" 
ON public.vendor_bonds FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own bonds" 
ON public.vendor_bonds FOR INSERT
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "System can manage vendor bonds" 
ON public.vendor_bonds FOR ALL
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_bonds_updated_at
BEFORE UPDATE ON public.vendor_bonds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create vendor_verifications table for tracking verification steps
CREATE TABLE IF NOT EXISTS public.vendor_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  verification_type text NOT NULL, -- '2fa', 'pgp', 'bond', 'identity'
  status text DEFAULT 'pending', -- 'pending', 'verified', 'failed'
  verification_data jsonb,
  verified_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vendors can view their own verifications" 
ON public.vendor_verifications FOR SELECT
USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can create their own verifications" 
ON public.vendor_verifications FOR INSERT
WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "System can manage verifications" 
ON public.vendor_verifications FOR ALL
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_verifications_updated_at
BEFORE UPDATE ON public.vendor_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();