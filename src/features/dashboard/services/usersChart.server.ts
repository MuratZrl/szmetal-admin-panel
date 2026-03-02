// src/features/dashboard/services/charts.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type Series = { labels: string[]; data: number[] };

// Sadece users döneceğiz
export type DashboardCharts = {
  users: Series;
};

/* ---------- Yardımcılar: takvim ayı + UTC güvenliği ---------- */
function monthStartUTC(y: number, m: number): Date {
  return new Date(Date.UTC(y, m, 1, 0, 0, 0));
}

function lastNCalendarMonthsUTC(n: number): Date[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const arr: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    arr.push(monthStartUTC(y, m - i));
  }
  return arr;
}

function yyyyMMUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabelTR(d: Date): string {
  return d.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
}

type CreatedAtRow = { created_at: string };

function buildSeries(rows: { created_at: string }[], monthStartsUTC: Date[]): Series {
  const counts = new Map<string, number>();

  for (const r of rows ?? []) {
    const dt = new Date(r.created_at);
    const key = yyyyMMUTC(monthStartUTC(dt.getUTCFullYear(), dt.getUTCMonth()));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const labels = monthStartsUTC.map(monthLabelTR);
  const data = monthStartsUTC.map((m) => counts.get(yyyyMMUTC(m)) ?? 0);
  return { labels, data };
}

export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const supabase = await createSupabaseServerClient();

  // Son 6 takvim ayı (içinde bulunulan ay dahil)
  const months = lastNCalendarMonthsUTC(6);
  const fromISO = months[0].toISOString();

  const { data: userRows, error: usersErr } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', fromISO) as { data: CreatedAtRow[] | null; error: unknown };

  if (usersErr) throw usersErr;

  return {
    users: buildSeries(userRows ?? [], months),
  };
}

// --------------- Date-range variant ---------------
import type { DateRange, BucketStrategy, SeriesData } from '../types/dashboardData';
import { type Buckets, buildSeriesFromBuckets } from '../utils/dateRanges';

export async function fetchUsersSeriesForRange(
  range: DateRange,
  buckets: Buckets,
  strategy: BucketStrategy,
): Promise<SeriesData> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', range.startISO)
    .lt('created_at', range.endISO) as { data: CreatedAtRow[] | null; error: unknown };
  if (error) throw error;
  return buildSeriesFromBuckets(data ?? [], buckets, strategy);
}
