-- Add Fútbol Balear bento slots for assignable news in that section
ALTER TYPE public.bento_slot ADD VALUE IF NOT EXISTS 'futbol_1';
ALTER TYPE public.bento_slot ADD VALUE IF NOT EXISTS 'futbol_2';
ALTER TYPE public.bento_slot ADD VALUE IF NOT EXISTS 'futbol_3';

-- Site settings table for configurable values (e.g. YouTube video URL)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site_settings"
  ON public.site_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Default YouTube video for Fútbol Balear section
INSERT INTO public.site_settings (key, value)
VALUES ('futbol_balear_youtube_id', 'OZLjUDXTVc4')
ON CONFLICT (key) DO NOTHING;
