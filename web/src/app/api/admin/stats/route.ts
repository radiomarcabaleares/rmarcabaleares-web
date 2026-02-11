import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const [newsRes, adsRes, contactsRes, usersRes] = await Promise.all([
      supabase.from('news').select('id, is_published', { count: 'exact' }),
      supabase.from('ads').select('id, is_active', { count: 'exact' }),
      supabase.from('contact_submissions').select('id', { count: 'exact' }).eq('is_read', false),
      supabase.from('profiles').select('id', { count: 'exact' }),
    ]);

    const newsData = newsRes.data || [];
    const adsData = adsRes.data || [];

    return NextResponse.json({
      data: {
        publishedNews: newsData.filter((n: any) => n.is_published).length,
        draftNews: newsData.filter((n: any) => !n.is_published).length,
        activeAds: adsData.filter((a: any) => a.is_active).length,
        unreadContacts: contactsRes.count || 0,
        totalUsers: usersRes.count || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
