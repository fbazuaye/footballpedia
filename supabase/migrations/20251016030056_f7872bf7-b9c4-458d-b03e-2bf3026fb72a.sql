-- First, delete all existing conversations and messages without user_id
DELETE FROM public.chat_messages WHERE user_id IS NULL;
DELETE FROM public.conversations WHERE user_id IS NULL;

-- Now update conversations table to require user_id
ALTER TABLE public.conversations 
ALTER COLUMN user_id SET NOT NULL;

-- Update chat_messages table to require user_id
ALTER TABLE public.chat_messages 
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing public policies
DROP POLICY IF EXISTS "Public read access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public insert access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public update access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public delete access to conversations" ON public.conversations;

DROP POLICY IF EXISTS "Public read access to messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public insert access to messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public update access to messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public delete access to messages" ON public.chat_messages;

-- Create user-specific policies for conversations
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
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create user-specific policies for chat_messages
CREATE POLICY "Users can view their own messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);