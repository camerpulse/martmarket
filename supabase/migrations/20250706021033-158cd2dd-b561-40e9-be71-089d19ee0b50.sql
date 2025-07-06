-- Create bitcoin addresses table for xPub-derived addresses
CREATE TABLE public.bitcoin_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  address_index INTEGER NOT NULL,
  address_path TEXT NOT NULL, -- e.g., 'm/0/1', 'm/1/5'
  purpose TEXT NOT NULL CHECK (purpose IN ('user_deposit', 'vendor_bond', 'escrow', 'vendor_payout', 'platform_fee')),
  user_id UUID REFERENCES public.profiles(user_id),
  order_id UUID REFERENCES public.orders(id),
  vendor_bond_id UUID REFERENCES public.vendor_bonds(id),
  is_used BOOLEAN DEFAULT false,
  balance_satoshis BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bitcoin transactions table for monitoring payments
CREATE TABLE public.bitcoin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  txid TEXT NOT NULL UNIQUE,
  address_id UUID NOT NULL REFERENCES public.bitcoin_addresses(id),
  amount_satoshis BIGINT NOT NULL,
  confirmations INTEGER DEFAULT 0,
  block_height INTEGER,
  is_incoming BOOLEAN DEFAULT true,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal wallet balances table
CREATE TABLE public.wallet_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) UNIQUE,
  balance_satoshis BIGINT DEFAULT 0,
  pending_deposits_satoshis BIGINT DEFAULT 0,
  escrow_locked_satoshis BIGINT DEFAULT 0,
  payout_pending_satoshis BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment tracking table for vendor bonds and orders
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('vendor_bond', 'order_payment', 'deposit')),
  amount_satoshis BIGINT NOT NULL,
  amount_usd DECIMAL(10,2),
  bitcoin_address_id UUID NOT NULL REFERENCES public.bitcoin_addresses(id),
  vendor_bond_id UUID REFERENCES public.vendor_bonds(id),
  order_id UUID REFERENCES public.orders(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system configuration table for xPub and settings
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.bitcoin_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bitcoin_addresses
CREATE POLICY "Users can view their own addresses" ON public.bitcoin_addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage all addresses" ON public.bitcoin_addresses FOR ALL USING (true);

-- Create RLS policies for bitcoin_transactions  
CREATE POLICY "Users can view their transactions" ON public.bitcoin_transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bitcoin_addresses ba 
    WHERE ba.id = bitcoin_transactions.address_id 
    AND ba.user_id = auth.uid()
  )
);
CREATE POLICY "System can manage all transactions" ON public.bitcoin_transactions FOR ALL USING (true);

-- Create RLS policies for wallet_balances
CREATE POLICY "Users can view their own balance" ON public.wallet_balances FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own balance" ON public.wallet_balances FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can manage all balances" ON public.wallet_balances FOR ALL USING (true);

-- Create RLS policies for payment_requests
CREATE POLICY "Users can view their own payment requests" ON public.payment_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create payment requests" ON public.payment_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "System can manage all payment requests" ON public.payment_requests FOR ALL USING (true);

-- Create RLS policies for system_config (admin only, but we'll handle this in functions)
CREATE POLICY "System can manage config" ON public.system_config FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_bitcoin_addresses_user_purpose ON public.bitcoin_addresses(user_id, purpose);
CREATE INDEX idx_bitcoin_addresses_address ON public.bitcoin_addresses(address);
CREATE INDEX idx_bitcoin_transactions_address ON public.bitcoin_transactions(address_id);
CREATE INDEX idx_bitcoin_transactions_txid ON public.bitcoin_transactions(txid);
CREATE INDEX idx_payment_requests_user_status ON public.payment_requests(user_id, status);
CREATE INDEX idx_payment_requests_expires ON public.payment_requests(expires_at) WHERE status = 'pending';

-- Add triggers for updated_at columns
CREATE TRIGGER update_bitcoin_addresses_updated_at BEFORE UPDATE ON public.bitcoin_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallet_balances_updated_at BEFORE UPDATE ON public.wallet_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update vendor_bonds table to link with payment_requests
ALTER TABLE public.vendor_bonds ADD COLUMN payment_request_id UUID REFERENCES public.payment_requests(id);

-- Insert initial system configuration placeholders
INSERT INTO public.system_config (config_key, config_value, description) VALUES 
('xpub_master', 'PLACEHOLDER_XPUB_KEY', 'Master xPub key for generating Bitcoin addresses'),
('address_index_user_deposit', '0', 'Current index for user deposit addresses (m/0/x)'),
('address_index_vendor_bond', '0', 'Current index for vendor bond addresses (m/1/x)'), 
('address_index_escrow', '0', 'Current index for escrow addresses (m/2/x)'),
('address_index_vendor_payout', '0', 'Current index for vendor payout addresses (m/3/x)'),
('address_index_platform_fee', '0', 'Current index for platform fee addresses (m/4/x)'),
('btc_usd_rate', '100000', 'Current BTC to USD rate (in cents per satoshi)'),
('vendor_bond_amount_satoshis', '25000000', 'Vendor bond amount in satoshis (~$250 at $100k BTC)'),
('min_confirmation_count', '1', 'Minimum confirmations required for payment processing');