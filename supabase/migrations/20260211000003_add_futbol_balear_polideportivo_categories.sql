-- Add Fútbol Balear and Polideportivo categories for homepage sections
INSERT INTO public.categories (name, slug, color) VALUES
  ('Fútbol Balear', 'futbol-balear', '#1B3C6E'),
  ('Polideportivo', 'polideportivo', '#E2001A')
ON CONFLICT (slug) DO NOTHING;
