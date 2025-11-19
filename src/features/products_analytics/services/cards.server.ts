// src/features/products_analytics/services/cards.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type ProductStats = {
  totalCount: number;
  thisMonthCount: number;
  prevMonthCount: number;
  prevPrevMonthCount: number;
};

type CountResultShape = {
  count: number | null;
  error: unknown;
};

function toSafeCount(result: CountResultShape): number {
  const { count } = result;
  if (typeof count === 'number' && Number.isFinite(count) && count >= 0) {
    return count;
  }
  return 0;
}

export async function getProductStats(): Promise<ProductStats> {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfPrevPrevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const startOfThisMonthIso = startOfThisMonth.toISOString();
  const startOfPrevMonthIso = startOfPrevMonth.toISOString();
  const startOfPrevPrevMonthIso = startOfPrevPrevMonth.toISOString();

  const [totalRes, thisMonthRes, prevMonthRes, prevPrevMonthRes] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonthIso),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevMonthIso)
      .lt('created_at', startOfThisMonthIso),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevPrevMonthIso)
      .lt('created_at', startOfPrevMonthIso),
  ]);

  const totalCount = toSafeCount(totalRes as CountResultShape);
  const thisMonthCount = toSafeCount(thisMonthRes as CountResultShape);
  const prevMonthCount = toSafeCount(prevMonthRes as CountResultShape);
  const prevPrevMonthCount = toSafeCount(prevPrevMonthRes as CountResultShape);

  return { totalCount, thisMonthCount, prevMonthCount, prevPrevMonthCount };
}

export function computeChangePercentage(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0;
  }

  if (previous <= 0) {
    if (current <= 0) {
      return 0;
    }
    return 100;
  }

  const diff = current - previous;
  const ratio = (diff / previous) * 100;

  if (!Number.isFinite(ratio)) {
    return 0;
  }

  return ratio;
}
