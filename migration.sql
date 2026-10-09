-- Migration to fix Supabase Auth registration error and secure role assignment
-- 1. Redefine the trigger function to fully qualify types (public.user_role)
-- 2. Remove insecure role assignment from untrusted metadata
-- 3. Safely enforce the default role to prevent privilege escalation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'student'::public.user_role
  );
  RETURN new;
END;
$$;
