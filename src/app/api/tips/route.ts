import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';

  // Use service role client if available (bypasses RLS for reads)
  // Otherwise fallback to anon client (needs permissive SELECT policy: using (true))
  const readClient = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : supabase;

  if (all) {
    const { data } = await readClient
      .from('system_tips')
      .select('*')
      .order('created_at', { ascending: false });
    return NextResponse.json(data || []);
  }

  const { data } = await readClient
    .from('system_tips')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json(data || null);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify user identity via Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    // Use service role client (bypasses RLS) if available, 
    // otherwise use authenticated client (requires permissive insert RLS policy)
    const insertClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
      : createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

    const { data, error: insertError } = await insertClient
      .from('system_tips')
      .insert([{ title, content }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert tips error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Tips Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
