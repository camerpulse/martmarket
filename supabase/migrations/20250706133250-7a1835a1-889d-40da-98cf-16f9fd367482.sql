-- Enhanced Bitcoin Payment Processing System
CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  escrow_address TEXT NOT NULL,
  amount_satoshis BIGINT NOT NULL,
  platform_fee_satoshis BIGINT NOT NULL DEFAULT 0,
  vendor_fee_satoshis BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'funded', 'released', 'disputed', 'refunded'
  funded_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  dispute_started_at TIMESTAMP WITH TIME ZONE,
  auto_release_at TIMESTAMP WITH TIME ZONE, -- automatic release after X days
  release_txid TEXT,
  refund_txid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_request_id UUID REFERENCES payment_requests(id) ON DELETE CASCADE NOT NULL,
  txid TEXT NOT NULL,
  block_height INTEGER,
  confirmations INTEGER NOT NULL DEFAULT 0,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  amount_received_satoshis BIGINT NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  validation_errors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bitcoin_network_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_rate_sat_per_vbyte INTEGER NOT NULL,
  priority_level TEXT NOT NULL, -- 'economy', 'standard', 'priority'
  estimated_confirmation_blocks INTEGER NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bitcoin_network_fees ENABLE ROW LEVEL SECURITY;

-- Create policies for escrow transactions
CREATE POLICY "Users can view their escrow transactions" ON public.escrow_transactions
  FOR SELECT USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "System can manage escrow transactions" ON public.escrow_transactions
  FOR ALL USING (true);

-- Create policies for payment confirmations  
CREATE POLICY "Users can view confirmations for their payments" ON public.payment_confirmations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_requests pr 
      WHERE pr.id = payment_confirmations.payment_request_id 
      AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payment confirmations" ON public.payment_confirmations
  FOR ALL USING (true);

-- Create policy for network fees (public read)
CREATE POLICY "Anyone can view network fees" ON public.bitcoin_network_fees
  FOR SELECT USING (true);

CREATE POLICY "System can manage network fees" ON public.bitcoin_network_fees
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_escrow_transactions_order_id ON public.escrow_transactions(order_id);
CREATE INDEX idx_escrow_transactions_status ON public.escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_auto_release ON public.escrow_transactions(auto_release_at) 
  WHERE status = 'funded' AND auto_release_at IS NOT NULL;

CREATE INDEX idx_payment_confirmations_txid ON public.payment_confirmations(txid);
CREATE INDEX idx_payment_confirmations_confirmations ON public.payment_confirmations(confirmations);
CREATE INDEX idx_bitcoin_network_fees_captured ON public.bitcoin_network_fees(captured_at DESC);

-- Create triggers for timestamp updates
CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_confirmations_updated_at
  BEFORE UPDATE ON public.payment_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically release escrow after time limit
CREATE OR REPLACE FUNCTION public.auto_release_expired_escrow()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER := 0;
  escrow_record RECORD;
BEGIN
  -- Find all escrow transactions that should be auto-released
  FOR escrow_record IN
    SELECT * FROM public.escrow_transactions 
    WHERE status = 'funded' 
    AND auto_release_at IS NOT NULL 
    AND auto_release_at <= NOW()
  LOOP
    -- Update escrow status
    UPDATE public.escrow_transactions 
    SET status = 'released', 
        released_at = NOW() 
    WHERE id = escrow_record.id;
    
    -- Update order status
    UPDATE public.orders 
    SET status = 'completed', 
        completed_at = NOW() 
    WHERE id = escrow_record.order_id;
    
    released_count := released_count + 1;
    
    -- Log security event for auto-release
    INSERT INTO public.security_events (
      user_id,
      event_type,
      event_level,
      event_data
    ) VALUES (
      escrow_record.buyer_id,
      'escrow_auto_released',
      'info',
      jsonb_build_object(
        'escrow_id', escrow_record.id,
        'order_id', escrow_record.order_id,
        'amount_satoshis', escrow_record.amount_satoshis
      )
    );
  END LOOP;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate required confirmations based on amount
CREATE OR REPLACE FUNCTION public.get_required_confirmations(amount_satoshis BIGINT)
RETURNS INTEGER AS $$
BEGIN
  -- More confirmations for larger amounts
  IF amount_satoshis >= 100000000 THEN -- 1 BTC+
    RETURN 6;
  ELSIF amount_satoshis >= 10000000 THEN -- 0.1 BTC+
    RETURN 3;
  ELSIF amount_satoshis >= 1000000 THEN -- 0.01 BTC+
    RETURN 2;
  ELSE
    RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert initial network fee data
INSERT INTO public.bitcoin_network_fees (fee_rate_sat_per_vbyte, priority_level, estimated_confirmation_blocks) VALUES
(1, 'economy', 144),    -- ~24 hours
(5, 'standard', 6),     -- ~1 hour  
(20, 'priority', 1);    -- next block