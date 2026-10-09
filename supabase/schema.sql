-- Enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'trainer', 'hrd');

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create a secure function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Classes Table
CREATE TABLE public.classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  trainer_id uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Classes Policies
CREATE POLICY "Classes are viewable by everyone."
  ON public.classes FOR SELECT USING (true);

CREATE POLICY "Trainers can manage their own classes"
  ON public.classes FOR ALL
  USING (auth.uid() = trainer_id AND public.get_my_role() = 'trainer');

CREATE POLICY "HRD can manage all classes"
  ON public.classes FOR ALL
  USING (public.get_my_role() = 'hrd');


-- Attendance Table
CREATE TABLE public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) NOT NULL,
  student_id uuid REFERENCES public.profiles(id) NOT NULL,
  status text CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance Policies
CREATE POLICY "Students can view their own attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = student_id OR public.get_my_role() IN ('trainer', 'hrd'));

CREATE POLICY "Trainers can manage attendance for their classes"
  ON public.attendance FOR ALL
  USING (
    public.get_my_role() = 'trainer' AND 
    EXISTS (SELECT 1 FROM public.classes WHERE classes.id = attendance.class_id AND classes.trainer_id = auth.uid())
  );

CREATE POLICY "HRD can manage all attendance"
  ON public.attendance FOR ALL
  USING (public.get_my_role() = 'hrd');

-- Note: Students CANNOT INSERT/UPDATE/DELETE attendance. 
-- The absence of an INSERT/UPDATE policy for students strictly enforces this at the DB level.


-- Requests Table (e.g., Leave requests, material requests)
CREATE TABLE public.requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
  description text,
  document_url text,
  comments text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Requests Policies
CREATE POLICY "Users can view their own requests"
  ON public.requests FOR SELECT
  USING (auth.uid() = user_id OR public.get_my_role() IN ('trainer', 'hrd'));

CREATE POLICY "Students can insert their own requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.get_my_role() = 'student');

CREATE POLICY "Trainers can view requests"
  ON public.requests FOR SELECT
  USING (public.get_my_role() = 'trainer');

CREATE POLICY "HRD Heads can manage all requests"
  ON public.requests FOR ALL
  USING (public.get_my_role() = 'hrd');

-- Audit Logs Table
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  performed_by uuid REFERENCES public.profiles(id) NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HRD Heads can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.get_my_role() = 'hrd');
  
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.get_my_role() = 'hrd');

-- Function to handle new user signup and create a profile
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

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Students can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (string_to_array(name, '-'))[1]);

CREATE POLICY "Documents are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');
