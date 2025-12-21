CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  participant_1 UUID,
  participant_2 UUID,
  exchange_id_param UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  p1 UUID;
  p2 UUID;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Caller must be one of the participants
  IF auth.uid() NOT IN (participant_1, participant_2) THEN
    RAISE EXCEPTION 'Unauthorized: not a participant';
  END IF;

  -- Canonical ordering (critical)
  IF participant_1 < participant_2 THEN
    p1 := participant_1;
    p2 := participant_2;
  ELSE
    p1 := participant_2;
    p2 := participant_1;
  END IF;

  -- Insert or get existing (race-safe)
  INSERT INTO public.conversations (
    participant_1_id,
    participant_2_id,
    exchange_id
  )
  VALUES (
    p1,
    p2,
    exchange_id_param
  )
  ON CONFLICT (participant_1_id, participant_2_id, exchange_id)
  DO UPDATE
    SET participant_1_id = EXCLUDED.participant_1_id
  RETURNING id INTO conversation_id;

  RETURN conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID, UUID)
TO authenticated;