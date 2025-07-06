-- Real-time Encrypted Messaging System
CREATE TABLE public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  subject TEXT,
  is_encrypted BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  buyer_unread_count INTEGER DEFAULT 0,
  vendor_unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  encrypted_file_url TEXT NOT NULL, -- Stored in encrypted format
  encryption_key TEXT, -- PGP-encrypted file key
  is_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'dislike', 'heart', 'thumbs_up', 'thumbs_down'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction_type)
);

CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for message threads
CREATE POLICY "Users can view their message threads" ON public.message_threads
  FOR SELECT USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "Users can create message threads" ON public.message_threads
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "Users can update their message threads" ON public.message_threads
  FOR UPDATE USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

-- Create policies for message attachments
CREATE POLICY "Users can view attachments in their messages" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m 
      JOIN message_threads t ON (m.sender_id = t.buyer_id OR m.sender_id = t.vendor_id)
      WHERE m.id = message_attachments.message_id 
      AND (t.buyer_id = auth.uid() OR t.vendor_id = auth.uid())
    )
  );

CREATE POLICY "Users can add attachments to their messages" ON public.message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m 
      WHERE m.id = message_attachments.message_id 
      AND m.sender_id = auth.uid()
    )
  );

-- Create policies for message reactions
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m 
      JOIN message_threads t ON (m.sender_id = t.buyer_id OR m.sender_id = t.vendor_id)
      WHERE m.id = message_reactions.message_id 
      AND (t.buyer_id = auth.uid() OR t.vendor_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions to messages" ON public.message_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reactions" ON public.message_reactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON public.message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Create policies for typing indicators
CREATE POLICY "Users can view typing indicators in their threads" ON public.typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = typing_indicators.thread_id 
      AND (t.buyer_id = auth.uid() OR t.vendor_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their typing indicators" ON public.typing_indicators
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_message_threads_buyer_id ON public.message_threads(buyer_id);
CREATE INDEX idx_message_threads_vendor_id ON public.message_threads(vendor_id);
CREATE INDEX idx_message_threads_order_id ON public.message_threads(order_id);
CREATE INDEX idx_message_threads_last_message ON public.message_threads(last_message_at DESC);

CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_typing_indicators_thread_id ON public.typing_indicators(thread_id);
CREATE INDEX idx_typing_indicators_updated ON public.typing_indicators(updated_at);

-- Add thread_id column to existing messages table
ALTER TABLE public.messages ADD COLUMN thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE;
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update thread last_message_at when new message is added
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update thread's last_message_at and unread counts
  UPDATE public.message_threads 
  SET 
    last_message_at = NEW.created_at,
    buyer_unread_count = CASE 
      WHEN NEW.sender_id != buyer_id THEN buyer_unread_count + 1 
      ELSE buyer_unread_count 
    END,
    vendor_unread_count = CASE 
      WHEN NEW.sender_id != vendor_id THEN vendor_unread_count + 1 
      ELSE vendor_unread_count 
    END
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
CREATE TRIGGER update_thread_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.thread_id IS NOT NULL)
  EXECUTE FUNCTION public.update_thread_last_message();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_thread_as_read(
  thread_id_param UUID,
  user_id_param UUID
) RETURNS VOID AS $$
BEGIN
  -- Reset unread count for the user
  UPDATE public.message_threads
  SET 
    buyer_unread_count = CASE 
      WHEN buyer_id = user_id_param THEN 0 
      ELSE buyer_unread_count 
    END,
    vendor_unread_count = CASE 
      WHEN vendor_id = user_id_param THEN 0 
      ELSE vendor_unread_count 
    END
  WHERE id = thread_id_param
  AND (buyer_id = user_id_param OR vendor_id = user_id_param);
  
  -- Mark messages as read
  UPDATE public.messages
  SET is_read = TRUE
  WHERE thread_id = thread_id_param
  AND recipient_id = user_id_param
  AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;