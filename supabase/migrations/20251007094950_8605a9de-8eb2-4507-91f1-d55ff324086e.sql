-- Allow user_id to be nullable for anonymous users
ALTER TABLE public.conversations 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.chat_messages 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop authentication-required RLS policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Create public access RLS policies for conversations
CREATE POLICY "Public read access to conversations"
  ON public.conversations
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to conversations"
  ON public.conversations
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access to conversations"
  ON public.conversations
  FOR DELETE
  USING (true);

-- Create public access RLS policies for chat_messages
CREATE POLICY "Public read access to messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to messages"
  ON public.chat_messages
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access to messages"
  ON public.chat_messages
  FOR DELETE
  USING (true);