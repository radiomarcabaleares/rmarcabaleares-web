import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createServiceRoleClient();

  const { data: article, error } = await supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, email, avatar_url), media:news_media(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Fetch related news from same category
  let related = [];
  if (article.category_id) {
    const { data: relatedData } = await supabase
      .from('news')
      .select('*, category:categories(*), author:profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .eq('category_id', article.category_id)
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(4);
    if (relatedData) related = relatedData;
  }

  return NextResponse.json({ article, related });
}
