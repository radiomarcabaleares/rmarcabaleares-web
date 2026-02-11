-- Add horizontal banner positions for ads between homepage sections
ALTER TYPE public.ad_position ADD VALUE IF NOT EXISTS 'horizontal_1';
ALTER TYPE public.ad_position ADD VALUE IF NOT EXISTS 'horizontal_2';
