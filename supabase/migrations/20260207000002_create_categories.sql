CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#E2001A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Staff can insert categories" ON public.categories
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can update categories" ON public.categories
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Superadmin can delete categories" ON public.categories
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );
