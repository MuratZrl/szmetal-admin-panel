// src/features/dashboard/services/cards.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { unstable_noStore as noStore } from 'next/cache'; // ← ekle

type TrendDir = 'up' | 'down';
type Trend = { change: number | null; trend: TrendDir }; // ← null izin ver
type CountMonthlyRow = { this_month: number; prev_month: number };

type CountsRow = {
  total_users: number;
  total_systems: number;
  active_requests: number;
};

export type CardsTotals = {
  totalUsers: number;
  totalPendingRequests: number; // status = pending toplam
  totalSystems: number;
};

// CardsTrends tipini da buna uydur:
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

// ————— Helpers —————
function calcTrend(curr: number, prev: number): Trend {
  if (prev === 0) {
    // 0 → X: yüzde hesaplama yok, UI "Yeni" gösterecek
    return { change: null, trend: 'up' };
  }
  const deltaPct = ((curr - prev) / prev) * 100;
  return { change: Math.abs(deltaPct), trend: deltaPct >= 0 ? 'up' : 'down' };
}

function isCMArray(x: unknown): x is CountMonthlyRow[] {
  return Array.isArray(x) &&
    x.every(r => typeof (r as CountMonthlyRow)?.this_month === 'number' &&
                 typeof (r as CountMonthlyRow)?.prev_month === 'number');
}

function pickPendingTotal(arr: unknown): number {
  const list = Array.isArray(arr) ? arr as Array<{ label?: unknown; value?: unknown }> : [];
  const hit = list.find(i => String(i?.label ?? '').toLowerCase().includes('pending'));
  return Number(hit?.value ?? 0);
}

// ————— RPC köprüleri —————
async function getDashboardCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<CountsRow | null> {
  const { data, error } = await supabase.rpc('get_dashboard_counts');
  if (error) { console.error('get_dashboard_counts error', error); return null; }
  return Array.isArray(data) && data.length ? (data[0] as unknown as CountsRow) : null;
}

async function countMonthly(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: 'users' | 'systems' | 'requests',
  createdCol: string = 'created_at'
): Promise<CountMonthlyRow> {
  const { data, error } = await supabase.rpc('count_monthly', {
    p_schema: 'public',
    p_table: table,
    p_col: createdCol,
  });
  if (error) {
    console.error(`count_monthly error for ${table}.${createdCol}`, error);
    return { this_month: 0, prev_month: 0 };
  }
  if (!isCMArray(data) || data.length === 0) return { this_month: 0, prev_month: 0 };
  const row = data[0];
  return {
    this_month: Number(row.this_month ?? 0),
    prev_month: Number(row.prev_month ?? 0),
  };
}

async function countMonthlyPendingRequests(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<CountMonthlyRow> {
  const { data, error } = await supabase.rpc('count_monthly_pending_requests');
  if (error) {
    console.error('count_monthly_pending_requests error', error);
    return { this_month: 0, prev_month: 0 };
  }
  if (!isCMArray(data) || data.length === 0) return { this_month: 0, prev_month: 0 };
  const row = data[0];
  return {
    this_month: Number(row.this_month ?? 0),
    prev_month: Number(row.prev_month ?? 0),
  };
}

// ————— Ana servis —————
export async function fetchDashboardCards(): Promise<CardsData> {
  noStore();
  
  const supabase = await createSupabaseServerClient();

  // 1) Toplamlar
  const counts = await getDashboardCounts(supabase);
  const totalUsers = Number(counts?.total_users ?? 0);
  const totalSystems = Number(counts?.total_systems ?? 0);

  const byStatus = await supabase.rpc('get_requests_by_status');
  if (byStatus.error) console.error('get_requests_by_status error', byStatus.error);
  const totalPendingRequests = pickPendingTotal(byStatus.data);

  const totals: CardsTotals = {
    totalUsers,
    totalPendingRequests,
    totalSystems,
  };

  // 2) Aylık kıyaslar
  const [uCM, sCM, pCM] = await Promise.all([
    countMonthly(supabase, 'users', 'created_at'),
    countMonthly(supabase, 'systems', 'created_at'),
    countMonthlyPendingRequests(supabase),
  ]);

  const trends: CardsTrends = {
    user:    calcTrend(uCM.this_month, uCM.prev_month),
    request: calcTrend(pCM.this_month, pCM.prev_month),
    system:  calcTrend(sCM.this_month, sCM.prev_month),
  };

  const deltas: CardsDeltas = {
    user:    uCM.this_month,   // ÖNCE: uCM.this_month - uCM.prev_month
    request: pCM.this_month,   // ÖNCE: pCM.this_month - pCM.prev_month
    system:  sCM.this_month,   // ÖNCE: sCM.this_month - sCM.prev_month
  };

  return { totals, trends, deltas };
}
