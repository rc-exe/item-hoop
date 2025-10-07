-- Create function to update user rating stats
CREATE OR REPLACE FUNCTION public.update_user_rating_stats(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating NUMERIC;
  exchange_count INTEGER;
BEGIN
  -- Calculate average rating
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, exchange_count
  FROM exchange_ratings
  WHERE rated_id = user_id_param;

  -- Update user profile
  UPDATE profiles
  SET 
    rating = COALESCE(avg_rating, 0),
    total_exchanges = exchange_count
  WHERE id = user_id_param;
END;
$$;

-- Add trigger to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Get conversation ID for this message
  SELECT c.id INTO conv_id
  FROM conversations c
  WHERE (c.participant_1_id = NEW.sender_id AND c.participant_2_id = NEW.receiver_id)
     OR (c.participant_1_id = NEW.receiver_id AND c.participant_2_id = NEW.sender_id);

  -- Update conversation last message info
  IF conv_id IS NOT NULL THEN
    UPDATE conversations
    SET 
      last_message_id = NEW.id,
      last_message_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = conv_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for messages
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Add index for better performance on exchanges
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);
CREATE INDEX IF NOT EXISTS idx_exchanges_owner_id ON exchanges(owner_id);
CREATE INDEX IF NOT EXISTS idx_exchanges_requester_id ON exchanges(requester_id);

-- Add index for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;