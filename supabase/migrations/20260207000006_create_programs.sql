CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_path TEXT,
  days TEXT[] NOT NULL,
  start_hour INT NOT NULL,
  end_hour INT NOT NULL,
  is_coming_soon BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are viewable by everyone" ON public.programs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Superadmin can manage programs" ON public.programs
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
