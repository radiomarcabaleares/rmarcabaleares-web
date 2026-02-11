import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

function sanitizeFileName(name: string): string {
  const ext = name.split('.').pop() || 'jpg';
  const base = name.replace(/\.[^.]+$/, '');
  const clean = base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9_-]/g, '_') // replace special chars with _
    .replace(/_+/g, '_') // collapse multiple _
    .replace(/^_|_$/g, ''); // trim leading/trailing _
  return `${clean}.${ext}`;
}

export async function uploadImage(bucket: string, file: File, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteImage(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
