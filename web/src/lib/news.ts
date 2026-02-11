import { createClient } from '@/lib/supabase/client';
import type { News, BentoSlot } from '@/lib/supabase/types';

const supabase = createClient();

export async function getPublishedNews(page = 1, limit = 12, categorySlug?: string) {
  let query = supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, email)', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { news: data as News[], total: count || 0 };
}

export async function getFeaturedNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .not('bento_slot', 'is', null)
    .order('bento_slot');

  if (error) throw error;
  return data as News[];
}

export async function getNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, email), media:news_media(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw error;
  return data as News;
}

export async function getLatestNews(limit = 8, excludeIds: string[] = []) {
  let query = supabase
    .from('news')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .eq('is_featured', false)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as News[];
}

// Admin functions
export async function createNews(newsData: Partial<News>) {
  const { data, error } = await supabase
    .from('news')
    .insert(newsData as any)
    .select()
    .single();

  if (error) throw error;
  return data as News;
}

export async function updateNews(id: string, newsData: Partial<News>) {
  const { data, error } = await supabase
    .from('news')
    .update(newsData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as News;
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllNewsAdmin() {
  const { data, error } = await supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as News[];
}

export async function setBentoSlot(newsId: string, slot: BentoSlot | null) {
  if (slot) {
    // Clear existing news from this slot first
    await supabase
      .from('news')
      .update({ bento_slot: null, is_featured: false } as any)
      .eq('bento_slot', slot);
  }

  const { error } = await supabase
    .from('news')
    .update({
      bento_slot: slot,
      is_featured: slot !== null,
    } as any)
    .eq('id', newsId);

  if (error) throw error;
}
