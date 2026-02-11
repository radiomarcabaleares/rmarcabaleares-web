CREATE TYPE public.bento_slot AS ENUM ('large', 'horizontal', 'small_1', 'small_2');

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  cover_image_width INT,
  cover_image_height INT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  bento_slot public.bento_slot,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published news is viewable by everyone" ON public.news
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Staff can view all news" ON public.news
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can insert news" ON public.news
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Authors can update own news" ON public.news
  FOR UPDATE USING (
    auth.uid() = author_id
    OR public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can delete news" ON public.news
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS news_published_at_idx ON public.news(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS news_is_featured_idx ON public.news(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS news_is_favorite_idx ON public.news(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS news_category_idx ON public.news(category_id);
CREATE INDEX IF NOT EXISTS news_slug_idx ON public.news(slug);
CREATE INDEX IF NOT EXISTS news_bento_slot_idx ON public.news(bento_slot) WHERE bento_slot IS NOT NULL;

CREATE OR REPLACE FUNCTION public.enforce_single_favorite()
RETURNS TRIGGER AS $$
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

CREATE TRIGGER enforce_single_favorite_trigger
  BEFORE INSERT OR UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_favorite();
