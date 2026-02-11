-- Make enforce_single_favorite SECURITY DEFINER so the trigger can
-- update other authors' rows when clearing the previous favorite.
CREATE OR REPLACE FUNCTION public.enforce_single_favorite()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_favorite = TRUE THEN
    UPDATE public.news SET is_favorite = FALSE, bento_slot = NULL
    WHERE is_favorite = TRUE AND id != NEW.id;
    NEW.bento_slot = 'large';
    NEW.is_featured = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
