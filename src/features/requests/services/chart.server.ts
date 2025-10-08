// src/features/requests/services/chart.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

/** LineAreaChart için minimal seri tipi */
export type LineSeriesData = { label: string; data: number[] };
export type LineChartData = { labels: string[]; series: LineSeriesData[] };
export type RequestsLineCharts = { totals: LineChartData; byStatus: LineChartData };

/* ---------------- helpers (UTC ay sonu mantığı) ---------------- */
function startOfMonthUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}
function addMonthsUTC(d: Date, m: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1, 0, 0, 0, 0));
}
function lastNMonthsStartsUTC(n: number): Date[] {
  const base = startOfMonthUTC(new Date());
  const arr: Date[] = [];
  for (let i = n - 1; i >= 0; i--) arr.push(addMonthsUTC(base, -i));
  return arr;
}
/** "May", "Haz" gibi TR kısa ay etiketi */
function monthShortTR(d: Date): string {
  return d.toLocaleDateString('tr-TR', { month: 'short', timeZone: 'UTC' });
}

/** Ay sonu kesitleri:
 *  - Geçmiş aylar: bir SONRAKİ ayın 1’i 00:00 (exclusive)
 *  - Son nokta: now (canlı ay)
 */
function getMonthCutoffs(n: number): { labels: string[]; cutIso: string[] } {
  const months = lastNMonthsStartsUTC(n);
  const labels = months.map(monthShortTR);

  // default: her ay için cutoff = sonraki ayın başı
  const cutIso = months.map((m) => {
    const next = addMonthsUTC(m, 1);
    return next.toISOString();
  });

  // son cutoff = now
  cutIso[cutIso.length - 1] = new Date().toISOString();
  return { labels, cutIso };
}

/* ---------------- data-access ---------------- */
async function countBefore(isoExclusive: string, status?: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', isoExclusive);
  if (status) q = q.eq('status', status);
  const { count, error } = await q;
  if (error) {
    console.error('getRequestsLineCharts/countBefore error:', error);
    return 0;
  }
  return count ?? 0;
}

/** İki cutoff arasındaki aylık artış (aylık adet) */
async function countBetween(prevIsoExclusive: string, currIsoExclusive: string, status?: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', prevIsoExclusive)
    .lt('created_at', currIsoExclusive);
  if (status) q = q.eq('status', status);
  const { count, error } = await q;
  if (error) {
    console.error('getRequestsLineCharts/countBetween error:', error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Son 6 ay için:
 *  - totals: ay SONU toplam talepler (tek seri)
 *  - byStatus: ay SONU statü bazlı toplamlar
 *  - cumulative=false iken ay bazlı artışları verir (aylık adet),
 *    cumulative=true iken doğrudan ay sonu toplamları verir.
 */
export async function getRequestsLineCharts(options?: { cumulative?: boolean }): Promise<RequestsLineCharts> {
  const N = 6;
  const { labels, cutIso } = getMonthCutoffs(N);

  /* ---------- Toplam seri ---------- */
  let totalSeries: number[];

  if (options?.cumulative) {
    // Her cutoff öncesi toplam (ay sonu toplamı)
    totalSeries = await Promise.all(cutIso.map((iso) => countBefore(iso)));
  } else {
    // Aylık artış: ardışık cutoff'lar arası adet
    const monthly: number[] = [];
    let prevIso = addMonthsUTC(startOfMonthUTC(new Date()), -N + 0).toISOString();
    for (let i = 0; i < cutIso.length; i++) {
      const currIso = cutIso[i]!;
      const inc = await countBetween(prevIso, currIso);
      monthly.push(inc);
      prevIso = currIso;
    }
    totalSeries = monthly;
  }

  /* ---------- Statü bazlı ---------- */
  // Bu statüler yoksa DB’den gelenlerle genişletmek isterseniz farklı sorgu yazılır.
  const KNOWN: readonly string[] = ['pending', 'approved', 'rejected'];

  const byStatusData: Array<{ label: string; data: number[] }> = [];

  for (const status of KNOWN) {
    if (options?.cumulative) {
      const arr = await Promise.all(cutIso.map((iso) => countBefore(iso, status)));
      // hiç veri yoksa komple 0 seriyi atla
      if (arr.some((v) => v > 0)) byStatusData.push({ label: status, data: arr });
    } else {
      // aylık artışlar
      const monthly: number[] = [];
      let prevIso = addMonthsUTC(startOfMonthUTC(new Date()), -N + 0).toISOString();
      for (let i = 0; i < cutIso.length; i++) {
        const currIso = cutIso[i]!;
        const inc = await countBetween(prevIso, currIso, status);
        monthly.push(inc);
        prevIso = currIso;
      }
      if (monthly.some((v) => v > 0)) byStatusData.push({ label: status, data: monthly });
    }
  }

  // Statü sıralaması okunur olsun
  const order = ['pending', 'approved', 'rejected'];
  byStatusData.sort(
    (a, b) => (order.indexOf(a.label) === -1 ? 999 : order.indexOf(a.label)) - (order.indexOf(b.label) === -1 ? 999 : order.indexOf(b.label))
  );

  return {
    totals: { labels, series: [{ label: options?.cumulative ? 'Toplam Talepler' : 'Aylık Talepler', data: totalSeries }] },
    byStatus: { labels, series: byStatusData },
  };
}
