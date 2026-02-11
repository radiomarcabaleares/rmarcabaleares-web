import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const categoryId = searchParams.get('category') || null;
  const categorySlug = searchParams.get('categorySlug') || null;

  const supabase = await createServiceRoleClient();

  // Resolve category slug to ID if provided
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) resolvedCategoryId = cat.id;
  }

  let query = supabase
    .from('news')
    .select('*, category:categories(*), author:profiles(full_name, avatar_url)', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (resolvedCategoryId) {
    query = query.eq('category_id', resolvedCategoryId);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ news: data, total: count || 0 });
}
