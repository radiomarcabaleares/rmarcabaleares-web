import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, email, avatar_url)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .not('bento_slot', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ news: data });
}
