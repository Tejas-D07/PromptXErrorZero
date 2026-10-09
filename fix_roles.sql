CREATE OR REPLACE FUNCTION public.protect_role_update()
RETURNS trigger AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if the current user is HRD
    IF public.get_my_role() != 'hrd' THEN
      RAISE EXCEPTION 'Unauthorized: Only HRD can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_update ON public.profiles;
CREATE TRIGGER enforce_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_role_update();
