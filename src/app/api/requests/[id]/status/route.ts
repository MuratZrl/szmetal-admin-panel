// app/api/requests/[id]/status/route.ts

/**
 * PATCH benzeri: /api/requests/:id/status  → POST
 *
 * AMAÇ
 *  - 'requests' tablosunda sadece 'pending' durumundaki bir kaydı
 *    atomik olarak 'approved' veya 'rejected' hale getirir.
 *  - Başarılı bir geçişten sonra 'orders' tablosuna kullanıcıya
 *    gidecek bildirim amaçlı bir satır ekler (inbox).
 *
 * KİMLER ÇAĞIRABİLİR?
 *  - Auth zorunlu.
 *  - Sadece 'Admin' veya 'Manager' rolü. 'User' yasak.
 *
 * NEDEN POST?
 *  - App Router'da segment alan route'larda PATCH/PUT da olurdu,
 *    fakat burada "status değiştir" gibi bir işlem endpoint’i var
 *    ve ek yan etki (orders insert) üretiyor; POST ile ifade etmek
 *    pratik. İstersen method guard ile PATCH’a da açılabilir.
 *
 * DÖNÜŞ
 *  - 200: { id, status }  → güncel durum
 *  - 207: order insert başarısız ama request güncellendi
 *  - 400: geçersiz body/status
 *  - 401: yetkisiz
 *  - 403: rol uygun değil
 *  - 409: kayıt yok veya zaten final durumda
 *  - 500: veritabanı hatası
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* ------------------------------ Tipler ------------------------------ */
// Supabase tipleri: tablo sütunlarına tam uyum sağlamak için
type UsersRow       = Database['public']['Tables']['users']['Row'];
type RequestsRow    = Database['public']['Tables']['requests']['Row'];
type RequestsUpdate = Database['public']['Tables']['requests']['Update'];
type OrdersInsert   = Database['public']['Tables']['orders']['Insert'];
type ReqStatus      = RequestsRow['status']; // 'pending' | 'approved' | 'rejected'
type FinalStatus = Extract<ReqStatus, 'approved' | 'rejected'>;

/* ----------------------------- Helpers ------------------------------ */

/**
 * 'approved' | 'rejected' daraltması. Runtime guard + TS type predicate.
 */
function isFinalStatus(s: string): s is FinalStatus {
  return s === 'approved' || s === 'rejected';
}

/**
 * Body'den gelen status değerini normalize eder.
 * Harf durumu ve boşluklar temizlenir.
 */
function parseStatus(v: unknown): FinalStatus | null {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return isFinalStatus(s) ? s : null;
}

/**
 * Kullanıcıya gösterilecek kısa sipariş kodu.
 * UUID → "RQ-7D77EC3A" gibi.
 */
function shortCodeFromUuid(id: string): string {
  const compact = id.replace(/-/g, '').toUpperCase();
  return `RQ-${compact.slice(0, 8)}`;
}

/**
 * PostgREST/TypeScript generics zincirinde bazen .update/.insert çağrılarında
 * "never" infer’leriyle papaz olabiliyoruz. Aşağıdaki yardımcılar, “bu değer
 * yazılabilir parametredir” bilgisini TS’ye zorla kabul ettirir.
 * Not: runtime etkisi yok, sadece type-level cast.
 */
const asUpdate = <T,>(v: T) => v as unknown as never;
const asInsert = <T,>(v: T) => v as unknown as never;

/**
 * Request final olduktan sonra 'orders' için oluşturulacak payload.
 * Buradaki metinler kullanıcının Inbox/grid'inde okunur.
 * - order_code: request id’den türetilen kısa kod
 * - system_slug: varsa taşınır, system_type elimizde yoksa null
 * - message: onay/ret metni
 */
function toOrderPayload(args: {
  status: Extract<ReqStatus, 'approved' | 'rejected'>;
  userId: RequestsRow['user_id'];
  actorId: string;                       // onay/red veren staff
  requestId: RequestsRow['id'];
  systemSlug?: string | null;
}): OrdersInsert {
  const slug = typeof args.systemSlug === 'string'
    ? args.systemSlug.replace(/[-_]+/g, ' ').trim()
    : '';
  const subject = (slug ? slug[0].toUpperCase() + slug.slice(1) : 'Talebiniz') + ' talebiniz';
  const approved = args.status === 'approved';

  return {
    user_id: args.userId,
    request_id: args.requestId,
    order_code: shortCodeFromUuid(String(args.requestId)), // kısa kod
    system_slug: args.systemSlug ?? null,
    system_type: null,                    // bilgi yoksa boş bırak
    message: approved
      ? `${subject} başarıyla onaylandı.`
      : `${subject} reddedildi.`,
    status: args.status,
    is_read: false,
    actor_id: args.actorId,
    // created_at/updated_at DB default/trigger
  };
}

/* ----------------------------- Route ------------------------------- */
export async function POST(
  req: globalThis.Request,
  ctx: { params: Promise<{ id: string }> } // Next 15: dinamik segment param’ı Promise
) {
  // 1) Param + body doğrulama
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => null)) as { status?: unknown } | null;
  const next = parseStatus(body?.status);
  if (!id || !next) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  // 2) Supabase ve auth
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 3) Rol kontrolü — sadece Admin/Manager
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<Pick<UsersRow, 'role'>>();
  if (meErr) return NextResponse.json({ error: meErr.message }, { status: 500 });
  if (!me || (me.role !== 'Admin' && me.role !== 'Manager')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // 4) Atomik status geçişi: sadece pending → approved|rejected
  const patch: RequestsUpdate = { status: next };
  const { data: upd, error: updErr } = await supabase
    .from('requests')
    .update(asUpdate<RequestsUpdate>(patch))
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, status, user_id, system_slug')
    .maybeSingle<Pick<RequestsRow, 'id' | 'status' | 'user_id' | 'system_slug'>>();

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  if (!upd)   return NextResponse.json({ error: 'ALREADY_FINAL_OR_NOT_FOUND' }, { status: 409 });

  // 5) Kullanıcıya 'orders' üzerinden bildirim insert’i
  // RLS: staff’ın bu tabloya insert izni olması gerekir.
  const payload = toOrderPayload({
    status: upd.status as Extract<ReqStatus, 'approved' | 'rejected'>,
    userId: upd.user_id,
    actorId: user.id,
    requestId: upd.id,
    systemSlug: upd.system_slug,
  });

  const { error: ordErr } = await supabase
    .from('orders')
    .insert(asInsert<OrdersInsert>(payload));

  if (ordErr) {
    // 207 Multi-Status: ana işlem başarılı, ikincil yan etki başarısız.
    // UI bu durumda yine "onaylandı/reddedildi"yi gösterebilir, ama
    // bildirim grid’inde eksik satır için uyarı verebilir.
    return NextResponse.json(
      { id: upd.id, status: upd.status, warn: 'order_insert_failed', detail: ordErr.message },
      { status: 207 }
    );
  }

  // 6) Her şey yolunda
  return NextResponse.json({ id: upd.id, status: upd.status });
}
