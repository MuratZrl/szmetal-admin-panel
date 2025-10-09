// app/api/requests/route.ts

/**
 * POST: /api/requests
 *
 * AMAÇ
 *  - Kullanıcının "create_request" akışında step=3’e kadar ilerlettiği
 *    taslağı (system_drafts) alır, gerçek bir 'requests' kaydına dönüştürür
 *    ve taslağı temizler.
 *
 * GÜVENLİK
 *  - Same-origin kontrolü (basit CSRF önlemi): Origin/Referer ile isteğin host’u eşleşmeli.
 *  - Content-Type: application/json olmalı.
 *  - Auth zorunlu.
 *  - Kullanıcıya ait ilgili slug için draft.step en az 3 olmalı.
 *
 * DÖNÜŞ
 *  - 200: { ok: true, id } → oluşturulan request id’si
 *  - 400: body geçersiz veya step yetersiz
 *  - 401: yetkisiz
 *  - 403: CSRF blok
 *  - 415: içerik türü yanlış
 *  - 500: veritabanı hataları
 *
 * NOT
 *  - Bu endpoint sadece "talep OLUŞTURUR". Finalize etmez, sipariş bildirimi üretmez.
 *    Finalizasyon /api/requests/:id/status ile yapılır.
 */

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

/* ------------------------ Tablo tipleri ------------------------ */
// Tipleri dar tutarak select/insert dönüşlerini netleştiriyoruz.
type Drafts     = Database['public']['Tables']['system_drafts'];
type DraftRow   = Drafts['Row'];
type DraftSlim  = Pick<DraftRow, 'id' | 'step'>;

type Requests      = Database['public']['Tables']['requests'];
type RequestsRow   = Requests['Row'];
type RequestsInsert= Requests['Insert'];

/**
 * PostgREST zincirinde bazen .insert çağrısında TS "never" çıkarabiliyor.
 * asWriteParam ile TS’ye “bu Insert tipidir, yaz gitsin” demiş oluyoruz.
 * Runtime etkisi yok, salt type-level cast.
 */
function asWriteParam<T>(v: T) {
  return v as unknown as never;
}

/**
 * Same-origin kontrolü:
 * - production’da reverse proxy arkasında X-Forwarded-Host gelir.
 * - En kötü senaryoda referer veya origin host’u ile req host’u eşitlenmeli.
 * Bu basit kontrol CSRF riskini epey azaltır. İleri seviye için CSRF token.
 */
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

  // 1) Body doğrula ve daralt
  const { slug, form, summary, materials } = (await req.json()) as Body;
  if (!slug || typeof slug !== 'string' || !form) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  // Narrow’lar: DB JSON kolonlarına uygun generic Json
  const formData = form as Record<string, Json>;
  const summaryData = (summary ?? []) as unknown as Json;
  const materialData = (materials ?? []) as unknown as Json;

  // 2) Auth
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 3) Kullanıcının ilgili slug için draft’ı gerçekten step=3 mü?
  const { data: draft, error: dErr } = await supabase
    .from('system_drafts')
    .select('id, step')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle<DraftSlim>();   // dönüş tipini sabitle

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

  const draftStep = draft?.step as Step | undefined;
  if (!draft || !draftStep || draftStep < 3) {
    return NextResponse.json({ error: 'INSUFFICIENT_STEP' }, { status: 400 });
  }

  // 4) 'requests' kaydını oluştur
  const payload: RequestsInsert = {
    user_id: user.id,
    system_slug: slug,
    form_data: formData as unknown as Json,
    summary_data: summaryData,
    material_data: materialData,
    status: 'pending' as RequestsInsert['status'],
    description:
      typeof formData.description === 'string' ? (formData.description as string) : null,
  };

  const { data: inserted, error: insErr } = await supabase
    .from('requests')
    .insert(asWriteParam<RequestsInsert>(payload)) // never kaprisi bitti
    .select('id')
    .single<Pick<RequestsRow, 'id'>>();            // dönüş tipini sabitle

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? 'REQUEST_CREATE_FAILED' },
      { status: 500 }
    );
  }

  // 5) Draft’ı temizle ve akış cookie’sini sil
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
