import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

/** LineAreaChart için minimal seri tipi */
export type LineSeriesData = { label: string; data: number[] };
export type LineChartData = { labels: string[]; series: LineSeriesData[] };
export type RequestsLineCharts = { totals: LineChartData; byStatus: LineChartData };

type ReqRow = { created_at: string; status: string | null };

/* ---------------- helpers ---------------- */
function pad2(n: number): string { return n < 10 ? `0${n}` : String(n); }
function monthKeyUTC(d: Date): string { return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`; }
function lastDayOfMonthUTC(d: Date): number { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); }
function monthLabelTRWithRefDay(monthStartUTC: Date, refDay: number): string {
  const monthStr = monthStartUTC.toLocaleDateString('tr-TR', { month: 'short' });
  const clampedDay = Math.min(refDay, lastDayOfMonthUTC(monthStartUTC));
  return `${monthStr} ${clampedDay}`;
}
function startOfMonthUTC(d: Date): Date { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)); }
function addMonthsUTC(d: Date, m: number): Date { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1, 0, 0, 0, 0)); }
function lastNMonthsUTC(n: number): Date[] {
  const base = startOfMonthUTC(new Date());
  const arr: Date[] = [];
  for (let i = n - 1; i >= 0; i--) arr.push(addMonthsUTC(base, -i));
  return arr;
}

// prefix sum + başlangıç baz değeri
function toCumulative(arr: number[], base: number): number[] {
  const out = new Array<number>(arr.length);
  let acc = base;
  for (let i = 0; i < arr.length; i++) {
    acc += arr[i];
    out[i] = acc;
  }
  return out;
}

/* ---------------- data-access ---------------- */
async function countBefore(date: Date, status?: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('requests').select('*', { count: 'exact', head: true }).lt('created_at', date.toISOString());
  if (status) q = q.eq('status', status);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

/**
 * Son 6 ay için:
 *  - totals: aylık toplam talepler (tek seri)
 *  - byStatus: status bazlı çoklu seri
 *  - options.cumulative = true ise kümülatif toplamlar döner
 */
export async function getRequestsLineCharts(options?: { cumulative?: boolean }): Promise<RequestsLineCharts> {
  const supabase = await createSupabaseServerClient();

  const months = lastNMonthsUTC(6);
  const monthKeys = months.map(monthKeyUTC);

  // Etiketler dinamik günle
  const refDayTR = Number(new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric' }).format(new Date()));
  const labelsTR = months.map(m => monthLabelTRWithRefDay(m, refDayTR));

  const rangeStart = months[0];
  const rangeEnd = addMonthsUTC(months[months.length - 1], 1);

  const { data, error } = await supabase
    .from('requests')
    .select('created_at,status')
    .gte('created_at', rangeStart.toISOString())
    .lt('created_at', rangeEnd.toISOString());

  if (error) {
    // Hata durumunda boş seri
    const empty = new Array(months.length).fill(0) as number[];
    return {
      totals: { labels: labelsTR, series: [{ label: 'Toplam Talepler', data: empty }] },
      byStatus: { labels: labelsTR, series: [] },
    };
  }

  // Aylık sayımlar
  const totalsPerMonth = new Array<number>(months.length).fill(0);
  const byStatusMap: Record<string, number[]> = {};

  for (const row of (data ?? []) as ReqRow[]) {
    const idx = monthKeys.indexOf(monthKeyUTC(new Date(row.created_at)));
    if (idx === -1) continue;
    totalsPerMonth[idx] += 1;

    const st = (row.status ?? 'unknown').toString();
    if (!byStatusMap[st]) byStatusMap[st] = new Array<number>(months.length).fill(0);
    byStatusMap[st][idx] += 1;
  }

  // Status serileri için sıralama
  const order = ['pending', 'approved', 'rejected', 'canceled', 'cancelled', 'unknown'];
  const statusEntries = Object.entries(byStatusMap).sort((a, b) => {
    const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  // Kümülatif isteniyorsa, başlangıç bazını (rangeStart öncesi toplam) ekle
  let totalsSeriesData = totalsPerMonth;
  const byStatusSeries: LineSeriesData[] = [];

  if (options?.cumulative) {
    // Toplam için baz
    const baseTotal = await countBefore(rangeStart);

    totalsSeriesData = toCumulative(totalsPerMonth, baseTotal);

    // Status bazları: sadece grafikte bulunan status’lar için baz say
    const statuses = statusEntries.map(([s]) => s);
    const basePerStatusArr = await Promise.all(statuses.map(s => countBefore(rangeStart, s)));
    const basePerStatus: Record<string, number> = {};
    statuses.forEach((s, i) => { basePerStatus[s] = basePerStatusArr[i]; });

    for (const [status, monthly] of statusEntries) {
      byStatusSeries.push({ label: status, data: toCumulative(monthly, basePerStatus[status] ?? 0) });
    }
  } else {
    for (const [status, monthly] of statusEntries) {
      byStatusSeries.push({ label: status, data: monthly });
    }
  }

  return {
    totals: {
      labels: labelsTR,
      series: [{ label: 'Toplam Talepler', data: totalsSeriesData }],
    },
    byStatus: {
      labels: labelsTR,
      series: byStatusSeries,
    },
  };
}
