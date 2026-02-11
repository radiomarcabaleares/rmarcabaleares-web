-- Add has_drop_cap column to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS has_drop_cap BOOLEAN DEFAULT false;
