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

/** Tek tip: public şemalı Supabase client */
type PublicClient = SupabaseClient<Database, 'public'>;

/** Supabase count null dönerse 0’a sabitle */
function safeCount(n: number | null): number {
  return Number.isFinite(n as number) ? (n as number) : 0;
}

/** UTC ay başlangıcı (güvenli sınırlar) */
function monthStartUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

function computeChange(prev: number, curr: number): { pct: number | null; trend: TrendDir; delta: number } {
  const delta = curr - prev;
  const trend: TrendDir = delta >= 0 ? 'up' : 'down';
  if (prev <= 0) return { pct: null, trend, delta };
  const pct = Math.round((Math.abs(delta) / prev) * 100);
  return { pct, trend, delta };
}

/** Yalnızca bu dosyada kullanılan admin client (RLS bypass). Client’a sızmaz. */
function createSupabaseServiceClientOrNull(): PublicClient | null {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY; // .env.local zorunlu
  if (!SRV) return null;
  // İkinci generic parametreyi 'public' vererek tipi sabitliyoruz
  return createClient<Database, 'public'>(URL, SRV, { auth: { persistSession: false } });
}

/**
 * Admin/Clients kartları: toplamlar ve aylık değişimler
 * Bu dosyada service role varsa onu kullanır, yoksa normal server client’a düşer
 * (RLS açık kalır, sayılar eksik olabilir).
 */
export async function fetchClientsCards(): Promise<ClientsCardsData> {
  const admin = createSupabaseServiceClientOrNull();

  // Tipi tekilleştir: PublicClient
  let supabase: PublicClient;
  if (admin) {
    supabase = admin;
  } else {
    // Bazı kurulumlarda ssr client tipi farklı generic imzası taşıyabilir.
    // unknown üzerinden PublicClient'e sabitlemek, TS2352'yi güvenle çözer.
    supabase = (await createSupabaseServerClient()) as unknown as PublicClient;
  }

  // Ay sınırları
  const now = new Date();
  const startThis = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth());
  const startNext = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() + 1);
  const startPrev = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() - 1);

  // Toplamlar
  const totalQ       = supabase.from('users').select('id', { count: 'exact', head: true });
  const activeTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Active');
  const bannedTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Banned');

  // Bu ay eklenenler
  const newUsersThisQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const newUsersPrevQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startPrev.toISOString())
    .lt('created_at', startThis.toISOString());

  const newActiveThisQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Active')
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const newActivePrevQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Active')
    .gte('created_at', startPrev.toISOString())
    .lt('created_at', startThis.toISOString());

  const newBannedThisQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Banned')
    .gte('created_at', startThis.toISOString())
    .lt('created_at', startNext.toISOString());

  const newBannedPrevQ = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Banned')
    .gte('created_at', startPrev.toISOString())
    .lt('created_at', startThis.toISOString());

  const [
    totalRes,
    activeTotalRes,
    bannedTotalRes,
    newUsersThisRes,
    newUsersPrevRes,
    newActiveThisRes,
    newActivePrevRes,
    newBannedThisRes,
    newBannedPrevRes,
  ] = await Promise.all([
    totalQ,
    activeTotalQ,
    bannedTotalQ,
    newUsersThisQ,
    newUsersPrevQ,
    newActiveThisQ,
    newActivePrevQ,
    newBannedThisQ,
    newBannedPrevQ,
  ]);

  // Log (hata varsa gör)
  for (const [label, r] of [
    ['total', totalRes],
    ['activeTotal', activeTotalRes],
    ['bannedTotal', bannedTotalRes],
    ['newUsersThis', newUsersThisRes],
    ['newUsersPrev', newUsersPrevRes],
    ['newActiveThis', newActiveThisRes],
    ['newActivePrev', newActivePrevRes],
    ['newBannedThis', newBannedThisRes],
    ['newBannedPrev', newBannedPrevRes],
  ] as const) {
    if (r.error) console.error(`fetchClientsCards ${label} error:`, r.error);
  }

  const totals: ClientsCardsTotals = {
    totalUsers: safeCount(totalRes.count),
    totalActiveUsers: safeCount(activeTotalRes.count),
    totalBannedUsers: safeCount(bannedTotalRes.count),
  };

  const usersPrev  = safeCount(newUsersPrevRes.count);
  const usersThis  = safeCount(newUsersThisRes.count);
  const activePrev = safeCount(newActivePrevRes.count);
  const activeThis = safeCount(newActiveThisRes.count);
  const bannedPrev = safeCount(newBannedPrevRes.count);
  const bannedThis = safeCount(newBannedThisRes.count);

  const usersCh  = computeChange(usersPrev, usersThis);
  const activeCh = computeChange(activePrev, activeThis);
  const bannedCh = computeChange(bannedPrev, bannedThis);

  const trends: ClientsCardsTrends = {
    users: usersCh.pct === null ? null : { change: usersCh.pct, trend: usersCh.trend },
    active: activeCh.pct === null ? null : { change: activeCh.pct, trend: activeCh.trend },
    banned: bannedCh.pct === null ? null : { change: bannedCh.pct, trend: bannedCh.trend },
  };

  const deltas: ClientsCardsDeltas = {
    users: usersThis,
    active: activeThis,
    banned: bannedThis,
  };

  return { totals, trends, deltas };
}
