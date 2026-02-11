CREATE TYPE public.ad_position AS ENUM ('left', 'right', 'both');

CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position public.ad_position NOT NULL DEFAULT 'both',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active ads are viewable by everyone" ON public.ads
  FOR SELECT USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

CREATE POLICY "Ad staff can view all ads" ON public.ads
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('superadmin', 'publicista')
  );

CREATE POLICY "Ad staff can insert ads" ON public.ads
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('superadmin', 'publicista')
  );

CREATE POLICY "Ad staff can update ads" ON public.ads
  FOR UPDATE USING (
    auth.uid() = created_by
    OR public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "Superadmin can delete ads" ON public.ads
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'superadmin'
  );

CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS ads_is_active_idx ON public.ads(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS ads_position_idx ON public.ads(position);
