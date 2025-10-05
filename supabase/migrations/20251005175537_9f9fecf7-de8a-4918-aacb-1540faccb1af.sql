-- Add user_id column to conversations table to track ownership
ALTER TABLE public.conversations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to chat_messages table for consistency
ALTER TABLE public.chat_messages 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.chat_messages;

-- Create secure RLS policies for conversations (user-specific access)
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

-- Create secure RLS policies for chat_messages (user-specific access)
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

-- Create index for better query performance on user_id
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);