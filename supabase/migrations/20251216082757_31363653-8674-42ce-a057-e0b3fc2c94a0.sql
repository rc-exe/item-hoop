-- Enable RLS (safe if already enabled)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Recommended column (skip only if it already exists)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Index for unread badge performance (this actually matters)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read
ON public.messages (receiver_id, read_at);

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON public.messages;

-- Receiver can mark their messages as read
CREATE POLICY "Receivers can mark messages as read"
ON public.messages
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Sender and receiver can read messages
DROP POLICY IF EXISTS "Sender or receiver can view messages" ON public.messages;

CREATE POLICY "Sender or receiver can view messages"
ON public.messages
FOR SELECT
USING (
  auth.uid() = sender_id
  OR auth.uid() = receiver_id
);