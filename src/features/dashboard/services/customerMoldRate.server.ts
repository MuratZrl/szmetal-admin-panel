// src/features/dashboard/services/customerMoldRate.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { DateRange } from '../types/dashboardData';

/**
 * Müşteri Kalıbı Oranı — percentage of products that have customer molds.
 * Queries products table, counts has_customer_mold = true vs total.
 */

export async function fetchCustomerMoldRateAllTime(): Promise<{ rate: number; moldCount: number }> {
  const supabase = await createSupabaseServerClient();

  const [{ count: total }, { count: mold }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('has_customer_mold', true),
  ]);

  const t = total ?? 0;
  const m = mold ?? 0;
  return { rate: t > 0 ? Math.round((m / t) * 100) : 0, moldCount: m };
}

export async function fetchCustomerMoldRateForRange(range: DateRange): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const [{ count: total }, { count: mold }] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', range.startISO)
      .lt('created_at', range.endISO),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', range.startISO)
      .lt('created_at', range.endISO)
      .eq('has_customer_mold', true),
  ]);

  const t = total ?? 0;
  const m = mold ?? 0;
  return t > 0 ? Math.round((m / t) * 100) : 0;
}
