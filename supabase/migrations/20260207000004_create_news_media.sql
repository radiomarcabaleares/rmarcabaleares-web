CREATE TYPE public.media_type AS ENUM ('image', 'video');

CREATE TABLE IF NOT EXISTS public.news_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  media_type public.media_type NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  alt_text TEXT,
  width INT,
  height INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.news_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media of published news is viewable" ON public.news_media
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.news WHERE news.id = news_media.news_id AND news.is_published = TRUE)
  );

CREATE POLICY "Staff can view all media" ON public.news_media
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can insert media" ON public.news_media
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('superadmin', 'copywriter')
  );

CREATE POLICY "Staff can update media" ON public.news_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.news
      WHERE news.id = news_media.news_id
      AND (news.author_id = auth.uid() OR public.get_user_role(auth.uid()) = 'superadmin')
    )
  );

CREATE POLICY "Staff can delete media" ON public.news_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.news
      WHERE news.id = news_media.news_id
      AND (news.author_id = auth.uid() OR public.get_user_role(auth.uid()) = 'superadmin')
    )
  );

CREATE INDEX IF NOT EXISTS news_media_news_id_idx ON public.news_media(news_id);
