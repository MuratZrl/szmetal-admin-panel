// src/features/dashboard/services/productsChart.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type Series = { labels: string[]; data: number[] };

function monthStartUTC(y: number, m: number): Date {
  return new Date(Date.UTC(y, m, 1, 0, 0, 0));
}
function lastNCalendarMonthsUTC(n: number): Date[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const arr: Date[] = [];
  for (let i = n - 1; i >= 0; i--) arr.push(monthStartUTC(y, m - i));
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

type Row = { created_at: string };

function buildSeries(rows: Row[], monthStartsUTC: Date[]): Series {
  const counts = new Map<string, number>();
  for (const r of rows ?? []) {
    const dt = new Date(r.created_at);
    const key = yyyyMMUTC(monthStartUTC(dt.getUTCFullYear(), dt.getUTCMonth()));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return {
    labels: monthStartsUTC.map(monthLabelTR),
    data: monthStartsUTC.map((m) => counts.get(yyyyMMUTC(m)) ?? 0),
  };
}

/** Son n ay için ürün sayımı (oluşturulma tarihi) */
export async function fetchProductsSeries(nMonths = 6): Promise<Series> {
  const supabase = await createSupabaseServerClient();
  const months = lastNCalendarMonthsUTC(nMonths);
  const fromISO = months[0].toISOString();

  const { data, error } = await supabase
    .from('products')
    .select('created_at')
    .gte('created_at', fromISO) as { data: Row[] | null; error: unknown };

  if (error) throw error;
  return buildSeries(data ?? [], months);
}
