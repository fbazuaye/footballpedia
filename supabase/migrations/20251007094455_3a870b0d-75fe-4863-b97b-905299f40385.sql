-- First, delete any existing rows with null user_id (orphaned data)
DELETE FROM public.chat_messages WHERE user_id IS NULL;
DELETE FROM public.conversations WHERE user_id IS NULL;

-- Make user_id columns NOT NULL for security
ALTER TABLE public.conversations 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.chat_messages 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing permissive RLS policies on conversations
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.conversations;

-- Drop all existing permissive RLS policies on chat_messages
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.chat_messages;

-- Create secure user-specific RLS policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure user-specific RLS policies for chat_messages
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = chat_messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = chat_messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = chat_messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = chat_messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = chat_messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );