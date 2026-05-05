import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

function getWriteClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : supabase;
}

async function verifyAdmin(request: Request): Promise<{ ok: boolean; error?: NextResponse }> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1] || null;
  if (!token) return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || user.email !== ADMIN_EMAIL) {
    return { ok: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
  }
  return { ok: true };
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  const { error } = await getWriteClient()
    .from('system_tips')
    .delete()
    .eq('id', params.id);

  if (error) {
    console.error('Delete tip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  const { title, content } = await request.json();
  if (!title || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data, error } = await getWriteClient()
    .from('system_tips')
    .update({ title, content })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Update tip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
