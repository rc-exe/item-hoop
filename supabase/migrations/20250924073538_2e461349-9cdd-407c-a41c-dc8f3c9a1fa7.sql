-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  participant_1 UUID,
  participant_2 UUID,
  exchange_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  p1 UUID;
  p2 UUID;
BEGIN
  -- Ensure consistent ordering of participants
  IF participant_1 < participant_2 THEN
    p1 := participant_1;
    p2 := participant_2;
  ELSE
    p1 := participant_2;
    p2 := participant_1;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE participant_1_id = p1 
    AND participant_2_id = p2 
    AND (exchange_id IS NULL OR exchange_id = exchange_id_param);

  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id, exchange_id)
    VALUES (p1, p2, exchange_id_param)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;