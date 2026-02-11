import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

// PATCH /api/admin/profile - Update own profile
export async function PATCH(request: NextRequest) {
  try {
    // Verify auth with cookie-based client
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { full_name, avatar_url } = await request.json();

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'El nombre no puede estar vacio' }, { status: 400 });
    }

    const updateData: Record<string, any> = { full_name: full_name.trim() };
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    // Use service role to bypass RLS and ensure the update goes through
    const supabase = await createServiceRoleClient();
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
