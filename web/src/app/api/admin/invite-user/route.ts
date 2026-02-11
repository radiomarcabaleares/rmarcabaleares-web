import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify caller is superadmin
    const userClient = await createServerSupabaseClient();
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: profile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contrasena son obligatorios' }, { status: 400 });
    }

    if (!['superadmin', 'copywriter', 'publicista'].includes(role)) {
      return NextResponse.json({ error: 'Rol no valido' }, { status: 400 });
    }

    // Create user with service role
    const adminClient = await createServiceRoleClient();

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        role,
      },
    });

    if (createError) throw createError;

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
