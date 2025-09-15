import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type {
  RequestsTotals,
  RequestsTrends,
  RequestsDeltas,
  RequestsCardsData,
} from '@/features/requests/types';

type Status = 'pending' | 'approved';

async function countRequests(status?: Status): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('requests').select('*', { count: 'exact', head: true });
  if (status) q = q.eq('status', status);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

export async function getRequestsTotals(): Promise<RequestsTotals> {
  const [total, pending, approved] = await Promise.all([
    countRequests(),
    countRequests('pending'),
    countRequests('approved'),
  ]);
  return { total, pending, approved };
}

/* --------- Aylık eklenenler için yardımcılar --------- */
function startOfMonth(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  return x;
}
function addMonths(d: Date, m: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1, 0, 0, 0, 0));
}

async function countBetween(start: Date, end: Date, status?: Status): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  if (status) q = q.eq('status', status);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

type TrendDir = 'up' | 'down';
function toTrend(thisMonth: number, prevMonth: number): { change: number | null; trend: TrendDir } {
  // Önce yönü hesaplayalım (gösterilmeyecek olsa bile)
  const diff = thisMonth - prevMonth;
  const dir: TrendDir = diff >= 0 ? 'up' : 'down';

  // 1) Geçen ay 0 veya negatifse: yüzde göstermiyoruz (UI "Yeni"/"Değişim yok" label'ını kullanacak)
  if (prevMonth <= 0) {
    return { change: null, trend: dir };
  }

  // 2) ÖZEL KURAL: Geçen ay > 0, bu ay 0 ise kırmızı %100 göstermeyelim; yüzdeyi tamamen sakla
  if (thisMonth === 0) {
    return { change: null, trend: 'down' };
  }

  // 3) Normal hesap
  const pct = (diff / prevMonth) * 100;
  return { change: Math.round(pct), trend: dir };
}

/** Dashboard’taki mantıkla birebir: totals + (bu ay eklenenlere göre) trends ve deltas */
export async function getRequestsCardsData(): Promise<RequestsCardsData> {
  const totals = await getRequestsTotals();

  const now = new Date();
  const startThis = startOfMonth(now);
  const startNext = addMonths(startThis, 1);
  const startPrev = addMonths(startThis, -1);

  const [
    thisTot, prevTot,
    thisPen, prevPen,
    thisApp, prevApp,
  ] = await Promise.all([
    countBetween(startThis, startNext),
    countBetween(startPrev, startThis),
    countBetween(startThis, startNext, 'pending'),
    countBetween(startPrev, startThis, 'pending'),
    countBetween(startThis, startNext, 'approved'),
    countBetween(startPrev, startThis, 'approved'),
  ]);

  const trends: RequestsTrends = {
    total: toTrend(thisTot, prevTot),
    pending: toTrend(thisPen, prevPen),
    approved: toTrend(thisApp, prevApp),
  };

  const deltas: RequestsDeltas = {
    total: thisTot - prevTot,
    pending: thisPen - prevPen,
    approved: thisApp - prevApp,
  };

  const adds = {
    total: thisTot,
    pending: thisPen,
    approved: thisApp,
  };

  return { totals, trends, deltas, adds };
}
