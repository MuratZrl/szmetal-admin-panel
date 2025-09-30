// src/features/dashboard/services/cards.server.ts
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/supabaseAdmin'; // ← değişti

type TrendDir = 'up' | 'down';
type Trend = { change: number | null; trend: TrendDir };

export type CardsTotals = {
  totalUsers: number;
  totalPendingRequests: number;
  totalSystems: number;
};

export type CardsTrends = {
  user: { change: number | null; trend: TrendDir };
  request: { change: number | null; trend: TrendDir };
  system: { change: number | null; trend: TrendDir };
};

export type CardsDeltas = {
  user: number;
  request: number;
  system: number;
};

export type CardsData = {
  totals: CardsTotals;
  trends: CardsTrends; // yüzde
  deltas: CardsDeltas; // adet
};

// --------------- Helpers ---------------
function calcTrend(curr: number, prev: number): Trend {
  if (prev === 0) return { change: null, trend: 'up' };
  const deltaPct = ((curr - prev) / prev) * 100;
  return { change: Math.abs(deltaPct), trend: deltaPct >= 0 ? 'up' : 'down' };
}

function monthRange(offset: number): { startIso: string; endIso: string } {
  const base = new Date();
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset, 1, 0, 0, 0));
  const end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offset + 1, 1, 0, 0, 0));
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

type Client = Awaited<ReturnType<typeof createSupabaseAdminClient>>;

// Güvenli sayım: '*', head:true + detaylı log
async function countExact(
  sb: Client,
  table: 'users' | 'systems' | 'requests',
  where?: { column: string; value: string | number | boolean },
): Promise<number> {
  let q = sb.from(table).select('*', { count: 'exact', head: true });
  if (where) q = q.eq(where.column, where.value);
  const { count, error } = await q;
  if (error) {
    console.error('countExact error', { table, where, message: error.message, details: (error).details, hint: (error).hint });
    return 0;
  }
  return typeof count === 'number' ? count : 0;
}

async function countBetween(
  sb: Client,
  table: 'users' | 'systems' | 'requests',
  createdCol: string,
  startIso: string,
  endIso: string,
  where?: { column: string; value: string | number | boolean },
): Promise<number> {
  let q = sb
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte(createdCol, startIso)
    .lt(createdCol, endIso);
  if (where) q = q.eq(where.column, where.value);
  const { count, error } = await q;
  if (error) {
    console.error('countBetween error', { table, createdCol, startIso, endIso, where, message: error.message, details: (error).details, hint: (error).hint });
    return 0;
  }
  return typeof count === 'number' ? count : 0;
}

// --------------- Ana servis ---------------
export async function fetchDashboardCards(): Promise<CardsData> {
  noStore();
  const sb = createSupabaseAdminClient();

  // 1) Toplamlar (RPC YOK, direkt sayıyoruz)
  const [totalUsers, totalSystems, totalPendingRequests] = await Promise.all([
    countExact(sb, 'users'),
    countExact(sb, 'systems'),                 // 'systems' tablon yoksa bunu 'products' veya uygun tabloya çevir
    countExact(sb, 'requests', { column: 'status', value: 'pending' }),
  ]);

  const totals: CardsTotals = { totalUsers, totalPendingRequests, totalSystems };

  // 2) Aylık karşılaştırmalar
  const { startIso: curS, endIso: curE } = monthRange(0);
  const { startIso: prevS, endIso: prevE } = monthRange(-1);

  const [uCurr, uPrev, sCurr, sPrev, pCurr, pPrev] = await Promise.all([
    countBetween(sb, 'users', 'created_at', curS,  curE),
    countBetween(sb, 'users', 'created_at', prevS, prevE),
    countBetween(sb, 'systems', 'created_at', curS,  curE),
    countBetween(sb, 'systems', 'created_at', prevS, prevE),
    countBetween(sb, 'requests', 'created_at', curS,  curE,  { column: 'status', value: 'pending' }),
    countBetween(sb, 'requests', 'created_at', prevS, prevE, { column: 'status', value: 'pending' }),
  ]);

  const trends: CardsTrends = {
    user:    calcTrend(uCurr, uPrev),
    system:  calcTrend(sCurr, sPrev),
    request: calcTrend(pCurr, pPrev),
  };

  // Sen “bu ayki adet” göstermek istiyorum demişsin; önce fark alıyordun.
  const deltas: CardsDeltas = {
    user: uCurr,
    system: sCurr,
    request: pCurr,
  };

  return { totals, trends, deltas };
}
