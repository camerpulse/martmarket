-- Update RLS policies to allow general messaging between users
-- This allows users to message anyone, not just those they have orders with

-- Drop existing restrictive policies for message_threads
DROP POLICY IF EXISTS "Users can create message threads" ON message_threads;
DROP POLICY IF EXISTS "Users can view their message threads" ON message_threads;
DROP POLICY IF EXISTS "Users can update their message threads" ON message_threads;

-- Create new policies that allow any authenticated user to message any other user
CREATE POLICY "Users can create message threads with anyone" 
ON message_threads FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can view their message threads" 
ON message_threads FOR SELECT 
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can update their message threads" 
ON message_threads FOR UPDATE 
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

-- Keep admin bypass policy
-- (No need to recreate as it already exists)

-- Update the secure messaging function to allow creating threads without orders
CREATE OR REPLACE FUNCTION public.create_general_message_thread(
  participant1_id uuid,
  participant2_id uuid,
  subject_text text DEFAULT 'General Conversation'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  thread_id uuid;
  existing_thread_id uuid;
BEGIN
  -- Check if a thread already exists between these users
  SELECT id INTO existing_thread_id
  FROM message_threads
  WHERE (buyer_id = participant1_id AND vendor_id = participant2_id)
     OR (buyer_id = participant2_id AND vendor_id = participant1_id);
  
  IF existing_thread_id IS NOT NULL THEN
    RETURN existing_thread_id;
  END IF;
  
  -- Create new thread
  INSERT INTO message_threads (
    buyer_id,
    vendor_id,
    subject,
    order_id,
    is_encrypted
  ) VALUES (
    participant1_id,
    participant2_id,
    subject_text,
    NULL, -- No order required
    true
  ) RETURNING id INTO thread_id;
  
  RETURN thread_id;
END;
$$;