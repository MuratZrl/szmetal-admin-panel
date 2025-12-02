// src/features/products_analytics/services/cards.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type ProductStats = {
  totalCount: number;
  thisMonthCount: number;
  prevMonthCount: number;
  prevPrevMonthCount: number;
  /** has_customer_mold = true olan tüm ürünlerin toplam sayısı */
  totalWithCustomerMold: number;
  /** availability = true olan toplam ürün sayısı */
  totalAvailable: number;
  /** Bu ay eklenen Müşteri Kalıbı profilleri sayısı */
  thisMonthWithCustomerMoldCount: number;
  /** Bu ay eklenen kullanılabilir ürün sayısı */
  thisMonthAvailableCount: number;
  /** Geçen ay eklenen Müşteri Kalıbı profilleri sayısı */
  prevMonthWithCustomerMoldCount: number;
  /** Geçen ay eklenen kullanılabilir ürün sayısı */
  prevMonthAvailableCount: number;
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

  const [
    totalRes,
    thisMonthRes,
    prevMonthRes,
    prevPrevMonthRes,
    withCustomerMoldRes,
    availableRes,
    thisMonthWithCustomerMoldRes,
    thisMonthAvailableRes,
    prevMonthWithCustomerMoldRes,
    prevMonthAvailableRes,
  ] = await Promise.all([
    // Toplam ürün
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true }),

    // Bu ay eklenen tüm ürünler
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonthIso),

    // Geçen ay eklenen ürünler
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevMonthIso)
      .lt('created_at', startOfThisMonthIso),

    // Ondan önceki ay eklenen ürünler
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevPrevMonthIso)
      .lt('created_at', startOfPrevMonthIso),

    // Toplam Müşteri Kalıbı profili
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('has_customer_mold', true),

    // Toplam kullanılabilir ürün
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('availability', true),

    // Bu ay eklenen Müşteri Kalıbı profilleri
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonthIso)
      .eq('has_customer_mold', true),

    // Bu ay eklenen kullanılabilir ürünler
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonthIso)
      .eq('availability', true),

    // Geçen ay eklenen Müşteri Kalıbı profilleri
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevMonthIso)
      .lt('created_at', startOfThisMonthIso)
      .eq('has_customer_mold', true),

    // Geçen ay eklenen kullanılabilir ürünler
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfPrevMonthIso)
      .lt('created_at', startOfThisMonthIso)
      .eq('availability', true),
  ]);

  const totalCount = toSafeCount(totalRes as CountResultShape);
  const thisMonthCount = toSafeCount(thisMonthRes as CountResultShape);
  const prevMonthCount = toSafeCount(prevMonthRes as CountResultShape);
  const prevPrevMonthCount = toSafeCount(prevPrevMonthRes as CountResultShape);
  const totalWithCustomerMold = toSafeCount(withCustomerMoldRes as CountResultShape);
  const totalAvailable = toSafeCount(availableRes as CountResultShape);
  const thisMonthWithCustomerMoldCount = toSafeCount(
    thisMonthWithCustomerMoldRes as CountResultShape,
  );
  const thisMonthAvailableCount = toSafeCount(
    thisMonthAvailableRes as CountResultShape,
  );
  const prevMonthWithCustomerMoldCount = toSafeCount(
    prevMonthWithCustomerMoldRes as CountResultShape,
  );
  const prevMonthAvailableCount = toSafeCount(
    prevMonthAvailableRes as CountResultShape,
  );

  return {
    totalCount,
    thisMonthCount,
    prevMonthCount,
    prevPrevMonthCount,
    totalWithCustomerMold,
    totalAvailable,
    thisMonthWithCustomerMoldCount,
    thisMonthAvailableCount,
    prevMonthWithCustomerMoldCount,
    prevMonthAvailableCount,
  };
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
