// app/api/systems/draft/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, form } = body;
    if (!slug || !form) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

   const { error } = await supabase
    .from('system_drafts')
    .upsert(
      { user_id: user.id, slug, form_data: form },
      { onConflict: 'user_id,slug' }
    );

    if (error) {
      console.error('draft upsert error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { slug } = body as { slug?: string };
    if (!slug) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('system_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('slug', slug);

    if (error) {
      console.error('draft delete error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}