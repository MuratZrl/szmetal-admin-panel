// src/features/dashboard/services/charts.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { lastNMonthsAnchored, monthDayLabelTR, monthKeyYYYYMM } from '@/features/dashboard/utils/anchoredMonths';

type Series = { labels: string[]; data: number[] };

const STATUSES = ['pending', 'approved', 'rejected'] as const;
type RequestStatus = typeof STATUSES[number];
export type DashboardCharts = {
  users: Series;
  requests: Record<RequestStatus, Series>;
};

type CreatedAtRow = { created_at: string };
type RequestRow = { created_at: string; status: string };

function buildSeries(rows: { created_at: string }[], months: Date[]): Series {
  const counts = new Map<string, number>();
  for (const r of rows ?? []) {
    const dt = new Date(r.created_at);
    const key = monthKeyYYYYMM(new Date(dt.getFullYear(), dt.getMonth(), 1));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const labels = months.map(monthDayLabelTR);             // ← "Tem 13", "Ağu 13", ...
  const data = months.map(m => counts.get(monthKeyYYYYMM(m)) ?? 0);
  return { labels, data };
}

export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const supabase = await createSupabaseServerClient();

  // Bugünün gününe ankore edilmiş son 6 ay
  const months = lastNMonthsAnchored(6);

  // Sorgu kapsamı: ilk ayın BAŞI (1’i). Böylece ilk ayın baştaki günleri dışarıda kalmaz.
  const fromISO = new Date(months[0].getFullYear(), months[0].getMonth(), 1).toISOString();

  const { data: userRows, error: usersErr } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', fromISO) as { data: CreatedAtRow[] | null; error: unknown };
  if (usersErr) throw usersErr;

  const { data: reqRows, error: reqErr } = await supabase
    .from('requests')
    .select('created_at, status')
    .in('status', STATUSES)
    .gte('created_at', fromISO) as { data: RequestRow[] | null; error: unknown };
  if (reqErr) throw reqErr;

  const requests = {
    pending:  buildSeries((reqRows ?? []).filter(r => r.status === 'pending'),  months),
    approved: buildSeries((reqRows ?? []).filter(r => r.status === 'approved'), months),
    rejected: buildSeries((reqRows ?? []).filter(r => r.status === 'rejected'), months),
  } as const;

  return {
    users: buildSeries(userRows ?? [], months),
    requests,
  };
}
