import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/admin/maqueta - Fetch featured slots or available news
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available');

    if (available === 'true') {
      // Fetch published news without a bento_slot for assignment
      const { data, error } = await supabase
        .from('news')
        .select('*, category:categories(*)')
        .eq('is_published', true)
        .is('bento_slot', null)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    // Fetch current slot assignments
    const { data, error } = await supabase
      .from('news')
      .select('*, category:categories(*)')
      .eq('is_published', true)
      .eq('is_featured', true)
      .not('bento_slot', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/maqueta - Assign or unassign a news to a slot
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { action, newsId, slot, currentNewsId } = await request.json();

    if (action === 'assign') {
      // Clear current news from this slot if any
      if (currentNewsId) {
        await supabase.from('news').update({
          bento_slot: null,
          is_featured: false,
        }).eq('id', currentNewsId);
      }

      // Assign new news to slot
      const { error } = await supabase.from('news').update({
        bento_slot: slot,
        is_featured: true,
      }).eq('id', newsId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (action === 'unassign') {
      const updates: Record<string, any> = {
        bento_slot: null,
        is_featured: false,
      };

      // If it's the large/favorite slot, also remove favorite flag
      if (slot === 'large') {
        updates.is_favorite = false;
      }

      const { error } = await supabase.from('news').update(updates).eq('id', newsId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Accion no valida' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
