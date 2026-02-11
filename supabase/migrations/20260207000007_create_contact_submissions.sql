CREATE TYPE public.contact_department AS ENUM ('atencion_cliente', 'comercial');

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department public.contact_department NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Superadmin can view submissions" ON public.contact_submissions
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can update submissions" ON public.contact_submissions
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can delete submissions" ON public.contact_submissions
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE INDEX IF NOT EXISTS contact_submissions_department_idx ON public.contact_submissions(department);
CREATE INDEX IF NOT EXISTS contact_submissions_is_read_idx ON public.contact_submissions(is_read) WHERE is_read = FALSE;
