import { createClient } from '@/lib/supabase/client';
import type { Ad, AdPosition } from '@/lib/supabase/types';

const supabase = createClient();

export async function getActiveAds(position?: AdPosition) {
  let query = supabase
    .from('ads')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (position) {
    query = query.or(`position.eq.${position},position.eq.both`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ad[];
}

export async function getAllAdsAdmin() {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Ad[];
}

export async function createAd(adData: Partial<Ad>) {
  const { data, error } = await supabase
    .from('ads')
    .insert(adData as any)
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
}

export async function updateAd(id: string, adData: Partial<Ad>) {
  const { data, error } = await supabase
    .from('ads')
    .update(adData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
}

export async function deleteAd(id: string) {
  const { error } = await supabase.from('ads').delete().eq('id', id);
  if (error) throw error;
}
