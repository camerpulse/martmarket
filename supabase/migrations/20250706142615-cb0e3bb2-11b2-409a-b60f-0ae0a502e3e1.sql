-- Phase 2: Dispute Resolution System
-- Create comprehensive dispute management tables

-- Create dispute categories enum
CREATE TYPE public.dispute_category AS ENUM (
  'item_not_received',
  'item_not_as_described', 
  'damaged_item',
  'wrong_item',
  'counterfeit_item',
  'shipping_issues',
  'communication_issues',
  'refund_request',
  'other'
);

-- Create dispute status enum
CREATE TYPE public.dispute_status AS ENUM (
  'open',
  'under_review',
  'awaiting_buyer_response',
  'awaiting_vendor_response',
  'escalated',
  'resolved_favor_buyer',
  'resolved_favor_vendor',
  'resolved_mutual',
  'closed_no_action'
);

-- Create dispute priority enum
CREATE TYPE public.dispute_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Main disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  category public.dispute_category NOT NULL,
  status public.dispute_status DEFAULT 'open',
  priority public.dispute_priority DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  amount_disputed_btc NUMERIC(16,8),
  resolution_deadline TIMESTAMP WITH TIME ZONE,
  auto_close_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_type TEXT,
  resolution_notes TEXT,
  admin_assigned UUID,
  escalation_reason TEXT,
  escalated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Dispute messages for communication
CREATE TABLE public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_type TEXT DEFAULT 'message' CHECK (message_type IN ('message', 'evidence', 'system', 'resolution')),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

-- Dispute evidence table
CREATE TABLE public.dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  evidence_type TEXT CHECK (evidence_type IN ('image', 'document', 'video', 'link', 'text')),
  file_url TEXT,
  description TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Dispute resolutions tracking
CREATE TABLE public.dispute_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  resolved_by UUID,
  resolution_type TEXT CHECK (resolution_type IN ('refund_full', 'refund_partial', 'replacement', 'vendor_credit', 'no_action', 'escalate')),
  refund_amount_btc NUMERIC(16,8),
  resolution_details JSONB,
  buyer_agreed BOOLEAN,
  vendor_agreed BOOLEAN,
  admin_decision BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.dispute_resolutions ENABLE ROW LEVEL SECURITY;

-- Dispute statistics for analytics
CREATE TABLE public.dispute_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  total_disputes INTEGER DEFAULT 0,
  resolved_disputes INTEGER DEFAULT 0,
  disputes_favor_buyer INTEGER DEFAULT 0,
  disputes_favor_vendor INTEGER DEFAULT 0,
  average_resolution_days NUMERIC(5,2) DEFAULT 0,
  dispute_rate_percentage NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispute_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Users can view disputes they are involved in"
ON public.disputes FOR SELECT
USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "Buyers can create disputes for their orders"
ON public.disputes FOR INSERT
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Parties can update disputes they are involved in"
ON public.disputes FOR UPDATE
USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

-- RLS Policies for dispute messages
CREATE POLICY "Users can view messages in their disputes"
ON public.dispute_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.disputes d 
  WHERE d.id = dispute_id 
  AND (d.buyer_id = auth.uid() OR d.vendor_id = auth.uid())
  AND NOT is_internal
));

CREATE POLICY "Users can send messages in their disputes"
ON public.dispute_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.disputes d 
    WHERE d.id = dispute_id 
    AND (d.buyer_id = auth.uid() OR d.vendor_id = auth.uid())
  )
);

-- RLS Policies for dispute evidence
CREATE POLICY "Users can view evidence in their disputes"
ON public.dispute_evidence FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.disputes d 
  WHERE d.id = dispute_id 
  AND (d.buyer_id = auth.uid() OR d.vendor_id = auth.uid())
));

CREATE POLICY "Users can submit evidence for their disputes"
ON public.dispute_evidence FOR INSERT
WITH CHECK (
  submitted_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.disputes d 
    WHERE d.id = dispute_id 
    AND (d.buyer_id = auth.uid() OR d.vendor_id = auth.uid())
  )
);

-- RLS Policies for dispute resolutions
CREATE POLICY "Users can view resolutions for their disputes"
ON public.dispute_resolutions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.disputes d 
  WHERE d.id = dispute_id 
  AND (d.buyer_id = auth.uid() OR d.vendor_id = auth.uid())
));

CREATE POLICY "System can manage dispute resolutions"
ON public.dispute_resolutions FOR ALL
USING (true);

-- RLS Policies for dispute statistics
CREATE POLICY "Anyone can view dispute statistics"
ON public.dispute_statistics FOR SELECT
USING (true);

CREATE POLICY "System can manage dispute statistics"
ON public.dispute_statistics FOR ALL
USING (true);

-- Function to auto-escalate disputes
CREATE OR REPLACE FUNCTION public.auto_escalate_disputes()
RETURNS INTEGER AS $$
DECLARE
  escalated_count INTEGER := 0;
  dispute_record RECORD;
BEGIN
  -- Find disputes that should be auto-escalated
  FOR dispute_record IN
    SELECT * FROM public.disputes 
    WHERE status IN ('open', 'awaiting_buyer_response', 'awaiting_vendor_response')
    AND resolution_deadline IS NOT NULL 
    AND resolution_deadline <= NOW()
    AND status != 'escalated'
  LOOP
    -- Escalate the dispute
    UPDATE public.disputes 
    SET 
      status = 'escalated',
      escalated_at = NOW(),
      escalation_reason = 'Auto-escalated due to timeout',
      priority = CASE 
        WHEN priority = 'low' THEN 'medium'
        WHEN priority = 'medium' THEN 'high'
        ELSE priority
      END
    WHERE id = dispute_record.id;
    
    -- Add system message
    INSERT INTO public.dispute_messages (
      dispute_id,
      sender_id,
      message_type,
      content,
      is_internal
    ) VALUES (
      dispute_record.id,
      dispute_record.buyer_id, -- System message from buyer perspective
      'system',
      'This dispute has been automatically escalated due to no response within the deadline. An administrator will review this case.',
      false
    );
    
    escalated_count := escalated_count + 1;
  END LOOP;
  
  RETURN escalated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update dispute statistics
CREATE OR REPLACE FUNCTION public.update_dispute_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update statistics for the vendor
  WITH dispute_stats AS (
    SELECT 
      vendor_id,
      COUNT(*) as total_disputes,
      COUNT(*) FILTER (WHERE status LIKE 'resolved_%') as resolved_disputes,
      COUNT(*) FILTER (WHERE status = 'resolved_favor_buyer') as favor_buyer,
      COUNT(*) FILTER (WHERE status = 'resolved_favor_vendor') as favor_vendor,
      AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400) FILTER (WHERE resolved_at IS NOT NULL) as avg_days
    FROM public.disputes 
    GROUP BY vendor_id
  )
  INSERT INTO public.dispute_statistics (
    vendor_id, total_disputes, resolved_disputes, 
    disputes_favor_buyer, disputes_favor_vendor, 
    average_resolution_days, updated_at
  )
  SELECT 
    vendor_id, total_disputes, resolved_disputes,
    favor_buyer, favor_vendor, COALESCE(avg_days, 0), now()
  FROM dispute_stats
  WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
  ON CONFLICT (vendor_id) DO UPDATE SET
    total_disputes = EXCLUDED.total_disputes,
    resolved_disputes = EXCLUDED.resolved_disputes,
    disputes_favor_buyer = EXCLUDED.disputes_favor_buyer,
    disputes_favor_vendor = EXCLUDED.disputes_favor_vendor,
    average_resolution_days = EXCLUDED.average_resolution_days,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for dispute statistics
CREATE TRIGGER update_dispute_statistics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION update_dispute_statistics();

-- Function to update dispute timestamps
CREATE OR REPLACE FUNCTION public.update_dispute_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.update_dispute_updated_at();

CREATE TRIGGER update_dispute_messages_updated_at
BEFORE UPDATE ON public.dispute_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX idx_disputes_buyer_id ON public.disputes(buyer_id);
CREATE INDEX idx_disputes_vendor_id ON public.disputes(vendor_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at DESC);
CREATE INDEX idx_disputes_resolution_deadline ON public.disputes(resolution_deadline);

CREATE INDEX idx_dispute_messages_dispute_id ON public.dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created_at ON public.dispute_messages(created_at DESC);

CREATE INDEX idx_dispute_evidence_dispute_id ON public.dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_resolutions_dispute_id ON public.dispute_resolutions(dispute_id);