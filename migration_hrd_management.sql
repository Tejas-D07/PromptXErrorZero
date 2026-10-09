-- Add policy allowing HRD to update any profile (e.g. assigning roles)
CREATE POLICY "HRD can update any profile."
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'hrd');
