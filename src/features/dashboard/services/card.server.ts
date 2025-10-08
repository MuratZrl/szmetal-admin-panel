import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/supabaseAdmin';

type TrendDir = 'up' | 'down';
type Trend = { change: number | null; trend: TrendDir };

export type CardsTotals = {
  totalUsers: number;
  totalPendingRequests: number;
  totalProducts: number;
};

export type CardsTrends = {
  user: Trend;
  request: Trend;
  product: Trend;
};

export type CardsDeltas = {
  user: number;
  request: number;
  product: number;
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

async function countExact(
  sb: Client,
  table: 'users' | 'products' | 'requests',
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
  table: 'users' | 'products' | 'requests',
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

/** Belirli bir aya kadar (endIso dahil değil) kümülatif toplam say. */
async function countUntil(
  sb: Client,
  table: 'users' | 'products' | 'requests',
  createdCol: string,
  endIso: string,
  where?: { column: string; value: string | number | boolean },
): Promise<number> {
  let q = sb.from(table).select('*', { count: 'exact', head: true }).lt(createdCol, endIso);
  if (where) q = q.eq(where.column, where.value);
  const { count, error } = await q;
  if (error) {
    console.error('countUntil error', { table, createdCol, endIso, where, message: error.message, details: (error).details, hint: (error).hint });
    return 0;
  }
  return typeof count === 'number' ? count : 0;
}

// --------------- Ana servis ---------------
export async function fetchDashboardCards(): Promise<CardsData> {
  noStore();
  const sb = createSupabaseAdminClient();

  // 1) Toplamlar
  const [totalUsers, totalProducts, totalPendingRequests] = await Promise.all([
    countExact(sb, 'users'),
    countExact(sb, 'products'),
    countExact(sb, 'requests', { column: 'status', value: 'pending' }),
  ]);

  const totals: CardsTotals = { totalUsers, totalPendingRequests, totalProducts };

  // 2) Aylık aralıklar
  const { startIso: curS,  endIso: curE }  = monthRange(0);
  const { startIso: prevS, endIso: prevE } = monthRange(-1);
  const CREATED_COL = 'created_at';

  // Bu ay eklenen kullanıcı ve bekleyen talepler (delta için)
  const [uCurr, pendCurr, pendPrev] = await Promise.all([
    countBetween(sb, 'users',    CREATED_COL, curS,  curE),
    countBetween(sb, 'requests', CREATED_COL, curS,  curE, { column: 'status', value: 'pending' }),
    countBetween(sb, 'requests', CREATED_COL, prevS, prevE, { column: 'status', value: 'pending' }),
  ]);

  // Kullanıcı yüzdesi için KÜMÜLATİF toplamlar
  const [userTotalCurr, userTotalPrev] = await Promise.all([
    countUntil(sb, 'users', CREATED_COL, curE),   // bu ayın sonu itibarıyla toplam
    countUntil(sb, 'users', CREATED_COL, prevE),  // geçen ayın sonu itibarıyla toplam
  ]);

  // Ürün kartı: zaten kümülatif trend + bu ay eklenen delta
  const [prodTotalCurr, prodTotalPrev] = await Promise.all([
    countUntil(sb, 'products', CREATED_COL, curE),
    countUntil(sb, 'products', CREATED_COL, prevE),
  ]);
  const prodCurr = await countBetween(sb, 'products', CREATED_COL, curS, curE);

  const trends: CardsTrends = {
    user:    calcTrend(userTotalCurr, userTotalPrev),   // ← burada düzeldi
    request: calcTrend(pendCurr,      pendPrev),
    product: calcTrend(prodTotalCurr, prodTotalPrev),
  };

  const deltas: CardsDeltas = {
    user: uCurr,          // bu ay eklenen kullanıcı
    request: pendCurr,    // bu ay açılan bekleyen
    product: prodCurr,    // bu ay eklenen ürün
  };

  return { totals, trends, deltas };
}
