CREATE OR REPLACE FUNCTION public.get_total_exchange_count()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total integer;
BEGIN
  SELECT COALESCE(COUNT(*), 0)::integer
  INTO total
  FROM public.exchanges
  WHERE status IN ('completed');
  RETURN total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_total_exchange_count()
TO anon, authenticated;