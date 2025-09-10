// app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { clearFlowCookie } from '@/features/create_request/services/flowToken.server';
import type { Json, Database } from '@/types/supabase';

type Body = {
  slug: string;
  form: { [k: string]: Json } | null;
  summary: Array<{ [k: string]: Json }> | null;
  materials: Array<{ [k: string]: Json }> | null;
};

type Step = 1 | 2 | 3;

// Same-origin: origin/referrer, sunucunun gerçek host’u ile eşleşmeli
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host =
    req.headers.get('x-forwarded-host') ??
    req.headers.get('host') ??
    new URL(req.url).host;

  const originHost = origin ? new URL(origin).host : null;
  const refererHost = referer ? new URL(referer).host : null;

  if (!host) return false;
  return originHost === host || refererHost === host;
}

export async function POST(req: Request) {

  // 0) CSRF + içerik türü
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'CSRF_BLOCKED' }, { status: 403 });
  }

  const ctype = req.headers.get('content-type') ?? '';
  if (!ctype.includes('application/json')) {
    return NextResponse.json(
      { error: 'UNSUPPORTED_CONTENT_TYPE', expected: 'application/json' },
      { status: 415 }
    );
  }

  // 1) Body doğrula
  const { slug, form, summary, materials } = (await req.json()) as Body;
  if (!slug || typeof slug !== 'string' || !form) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  // 2) Auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 3) Kullanıcının draft’ı gerçekten step=3 mü?
  const { data: draft, error: dErr } = await supabase
    .from('system_drafts')
    .select('id, step')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle();

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });
  
  if (!draft || (draft.step as Step) < 3) {
    return NextResponse.json({ error: 'INSUFFICIENT_STEP' }, { status: 400 });
  }

  // 4) Talebi oluştur (kolon adlarını senin şemana uydurdum)
  type RequestsInsert = Database['public']['Tables']['requests']['Insert'];

  const payload: RequestsInsert = {
    user_id: user.id,
    system_slug: slug,
    form_data: form,
    summary_data: summary ?? [],
    material_data: materials ?? [],
    status: 'pending' as RequestsInsert['status'],
    description:
      typeof form.description === 'string' ? (form.description as string) : null,
  };

  const { data: inserted, error: insErr } = await supabase
    .from('requests')
    .insert(payload)
    .select('id')
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? 'REQUEST_CREATE_FAILED' },
      { status: 500 }
    );
  }

  // 5) Draft’ı temizle ve flow cookie’yi sil
  const { error: delErr } = await supabase
    .from('system_drafts')
    .delete()
    .eq('user_id', user.id)
    .eq('slug', slug);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  await clearFlowCookie();

  // 6) Başarılı yanıt
  return NextResponse.json({ ok: true, id: inserted.id });
}
