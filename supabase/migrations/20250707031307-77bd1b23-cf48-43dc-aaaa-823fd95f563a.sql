-- Add draft functionality and content flagging to messages
-- Create drafts table
CREATE TABLE public.message_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_username TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for drafts
ALTER TABLE public.message_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts" 
ON public.message_drafts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create content flags table for detecting off-platform communication
CREATE TABLE public.content_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID,
  draft_id UUID,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('email', 'phone', 'telegram', 'crypto_address', 'external_contact')),
  detected_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT FALSE,
  action_taken TEXT
);

-- Add RLS policies for content flags
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage content flags" 
ON public.content_flags 
FOR ALL 
USING (true);

-- Add foreign key relationships
ALTER TABLE public.content_flags 
ADD CONSTRAINT content_flags_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.content_flags 
ADD CONSTRAINT content_flags_draft_id_fkey 
FOREIGN KEY (draft_id) REFERENCES public.message_drafts(id) ON DELETE CASCADE;

-- Create trigger for draft updated_at
CREATE TRIGGER update_message_drafts_updated_at
BEFORE UPDATE ON public.message_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_message_drafts_user_id ON public.message_drafts(user_id);
CREATE INDEX idx_content_flags_user_id ON public.content_flags(user_id);
CREATE INDEX idx_content_flags_reviewed ON public.content_flags(reviewed);
CREATE INDEX idx_content_flags_flag_type ON public.content_flags(flag_type);