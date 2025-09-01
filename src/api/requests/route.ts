import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, form, summary, materials } = body;
    if (!slug || !form) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('requests').insert([{
      user_id: user.id,
      system_slug: slug,
      form_data: form,
      summary_data: summary || null,
      material_data: materials || null,
      status: 'pending',
      description: form.description || null,
    }]);

    if (error) {
      console.error('insert request error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
