import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado. Recarga la pagina.' }, { status: 401 });
    }

    const body = await request.json();
    const { newsId, newsData } = body;

    if (!newsData?.title?.trim() || !newsData?.content?.trim()) {
      return NextResponse.json({ error: 'Titulo y contenido son obligatorios' }, { status: 400 });
    }

    let result;
    if (newsId) {
      result = await supabase
        .from('news')
        .update(newsData)
        .eq('id', newsId);
    } else {
      newsData.author_id = user.id;
      result = await supabase
        .from('news')
        .insert(newsData);
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al guardar la noticia' },
      { status: 500 }
    );
  }
}
