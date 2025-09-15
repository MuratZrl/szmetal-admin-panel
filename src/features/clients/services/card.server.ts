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
  if (prev <= 0) {
    // prev=0 ise yüzde anlamsız. UI 'Yeni' gösterebilir.
    return { pct: null, trend, delta };
  }
  const pct = Math.round(Math.abs(delta) / prev * 100);
  return { pct, trend, delta };
}

/**
 * Admin/Clients üstündeki 3 kart için:
 * - Toplamlar
 * - Bu ay eklenen vs geçen ay eklenen
 */
export async function fetchClientsCards(): Promise<ClientsCardsData> {
  const supabase = await createSupabaseServerClient();

  // Ay sınırlarını UTC üzerinden belirle
  const now = new Date();
  const startThis = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth());
  const startNext = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() + 1);
  const startPrev = monthStartUTC(now.getUTCFullYear(), now.getUTCMonth() - 1);

  // Toplamlar
  const totalQ = supabase.from('users').select('id', { count: 'exact', head: true });
  const activeTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Active');
  const bannedTotalQ = supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'Banned');

  // Bu ay eklenenler (created_at’e göre)
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

  // Basit loglama
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

  // Aylık karşılaştırmalar
  const usersPrev = safeCount(newUsersPrevRes.count);
  const usersThis = safeCount(newUsersThisRes.count);
  const activePrev = safeCount(newActivePrevRes.count);
  const activeThis = safeCount(newActiveThisRes.count);
  const bannedPrev = safeCount(newBannedPrevRes.count);
  const bannedThis = safeCount(newBannedThisRes.count);

  const usersCh = computeChange(usersPrev, usersThis);
  const activeCh = computeChange(activePrev, activeThis);
  const bannedCh = computeChange(bannedPrev, bannedThis);

  const trends: ClientsCardsTrends = {
    users: usersCh.pct === null ? null : { change: usersCh.pct, trend: usersCh.trend },
    active: activeCh.pct === null ? null : { change: activeCh.pct, trend: activeCh.trend },
    banned: bannedCh.pct === null ? null : { change: bannedCh.pct, trend: bannedCh.trend },
  };

  // >>> SADECE BURAYI DEĞİŞTİR <<<
  const deltas: ClientsCardsDeltas = {
    users: usersThis,   // önceden: usersCh.delta
    active: activeThis, // önceden: activeCh.delta
    banned: bannedThis, // önceden: bannedCh.delta
  };

  return { totals, trends, deltas };
}
