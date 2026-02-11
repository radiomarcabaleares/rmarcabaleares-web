import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const position = searchParams.get('position') || null;

  const supabase = await createServiceRoleClient();

  let query = supabase
    .from('ads')
    .select('id, title, image_url, link_url, position')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (position) {
    query = query.eq('position', position);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ads: data });
}
