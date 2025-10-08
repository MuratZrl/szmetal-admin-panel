// src/features/clients/services/card.server.ts
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type TrendDir = 'up' | 'down';

export type ClientsCardsTotals = {
  totalUsers: number;
  totalActiveUsers: number;
  totalBannedUsers: number;
};

export type ChangeBlock = { change: number; trend: TrendDir };

export type ClientsCardsTrends = {
  users: ChangeBlock | null;
  active: ChangeBlock | null;
  banned: ChangeBlock | null;
};

export type ClientsCardsDeltas = {
  users: number;
  active: number;
  banned: number;
};

export type ClientsCardsData = {
  totals: ClientsCardsTotals;
  trends: ClientsCardsTrends;
  deltas: ClientsCardsDeltas;
};

type PublicClient = SupabaseClient<Database, 'public'>;

function safeCount(n: number | null): number {
  return Number.isFinite(n as number) ? (n as number) : 0;
}

/** UTC ay başlangıcı */
function monthStartUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/** prev→curr değişim: yüzde | null (prev=0’da null), yön ve delta */
function computeChange(prev: number, curr: number): { pct: number | null; trend: TrendDir; delta: number } {
  const delta = curr - prev;
  const trend: TrendDir = delta >= 0 ? 'up' : 'down';
  if (prev <= 0) return { pct: null, trend, delta };
  const pct = Math.round((Math.abs(delta) / prev) * 100);
  return { pct, trend, delta };
}

/** Service role varsa RLS bypass için admin client */
function createSupabaseServiceClientOrNull(): PublicClient | null {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SRV) return null;
  return createClient<Database, 'public'>(URL, SRV, { auth: { persistSession: false } });
}

/**
 * Clients kartları:
 * - totals.*: şu anki toplamlar
 * - trends.*: geçen ay toplam ↔ bu ay toplam karşılaştırması (MoM)
 * - deltas.*: bu ay eklenen adet (yeni kayıt sayısı)
 */
export async function fetchClientsCards(): Promise<ClientsCardsData> {
  const admin = createSupabaseServiceClientOrNull();
  const supabase: PublicClient = admin ?? ((await createSupabaseServerClient()) as unknown as PublicClient);

  // Ay sınırları
  const now = new Date();
  const startThis = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth());
  const startNext = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() + 1);

  /* -------- 1) Şu anki toplamlar (value) -------- */
  const totalQ       = supabase.from('users').select('id', { count: 'exact', head: true });
  const activeTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Active');
  const bannedTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Banned');

  /* -------- 2) Geçen ay sonu toplamları (trend için MoM) --------
     Not: Sadece created_at < startThis filtresiyle “geçen ayın sonundaki toplam”ı yaklaşıklarız.
     Soft delete/hareket tarihleri tutulmadığı için bu en makul snapshot. */
  const totalPrevQ       = supabase.from('users').select('id', { count: 'exact', head: true })
    .lt('created_at', startThis.toISOString());
  const activePrevQ      = supabase.from('users').select('id', { count: 'exact', head: true })
    .eq('status', 'Active').lt('created_at', startThis.toISOString());
  const bannedPrevQ      = supabase.from('users').select('id', { count: 'exact', head: true })
    .eq('status', 'Banned').lt('created_at', startThis.toISOString());

  /* -------- 3) Bu ay eklenen adetler (delta metni için) -------- */
  const newUsersThisQ = supabase.from('users').select('id', { count: 'exact', head: true })
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const newActiveThisQ = supabase.from('users').select('id', { count: 'exact', head: true })
    .eq('status', 'Active')
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const newBannedThisQ = supabase.from('users').select('id', { count: 'exact', head: true })
    .eq('status', 'Banned')
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const [
    totalRes,
    activeTotalRes,
    bannedTotalRes,
    totalPrevRes,
    activePrevRes,
    bannedPrevRes,
    newUsersThisRes,
    newActiveThisRes,
    newBannedThisRes,
  ] = await Promise.all([
    totalQ,
    activeTotalQ,
    bannedTotalQ,
    totalPrevQ,
    activePrevQ,
    bannedPrevQ,
    newUsersThisQ,
    newActiveThisQ,
    newBannedThisQ,
  ]);

  // Hata log
  for (const [label, r] of [
    ['total', totalRes],
    ['activeTotal', activeTotalRes],
    ['bannedTotal', bannedTotalRes],
    ['totalPrev', totalPrevRes],
    ['activePrev', activePrevRes],
    ['bannedPrev', bannedPrevRes],
    ['newUsersThis', newUsersThisRes],
    ['newActiveThis', newActiveThisRes],
    ['newBannedThis', newBannedThisRes],
  ] as const) {
    if (r.error) console.error(`fetchClientsCards ${label} error:`, r.error);
  }

  const totals: ClientsCardsTotals = {
    totalUsers: safeCount(totalRes.count),
    totalActiveUsers: safeCount(activeTotalRes.count),
    totalBannedUsers: safeCount(bannedTotalRes.count),
  };

  // MoM trendler: geçen ay toplam ↔ bu ay toplam
  const usersCh  = computeChange(safeCount(totalPrevRes.count), totals.totalUsers);
  const activeCh = computeChange(safeCount(activePrevRes.count), totals.totalActiveUsers);
  const bannedCh = computeChange(safeCount(bannedPrevRes.count), totals.totalBannedUsers);

  const trends: ClientsCardsTrends = {
    users:  usersCh.pct  === null ? null : { change: usersCh.pct,  trend: usersCh.trend },
    active: activeCh.pct === null ? null : { change: activeCh.pct, trend: activeCh.trend },
    banned: bannedCh.pct === null ? null : { change: bannedCh.pct, trend: bannedCh.trend },
  };

  // Delta: bu ay eklenen yeni kayıt adedi (caption için)
  const deltas: ClientsCardsDeltas = {
    users:  safeCount(newUsersThisRes.count),
    active: safeCount(newActiveThisRes.count),
    banned: safeCount(newBannedThisRes.count),
  };

  return { totals, trends, deltas };
}
