// src/app/api/dashboard/chart/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { getDateRangeConfig, generateBuckets } from '@/features/dashboard/utils/dateRanges';
import { fetchUsersSeriesForRange } from '@/features/dashboard/services/usersChart.server';
import { fetchProductsSeriesForRange } from '@/features/dashboard/services/productsChart.server';
import { fetchCategoryForRange } from '@/features/dashboard/services/categoryChart.server';
import { fetchCustomerMoldRateForRange } from '@/features/dashboard/services/customerMoldRate.server';
import type { DateRangeKey } from '@/features/dashboard/types/dashboardData';

const VALID_RANGES: DateRangeKey[] = ['today', 'thisWeek', 'thisMonth', 'thisYear', 'lastYear', 'allTime'];
const VALID_CHARTS = ['users', 'products', 'categoryPie', 'customerMold'] as const;
type ChartKey = (typeof VALID_CHARTS)[number];

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const chartParam = url.searchParams.get('chart');
  const rangeParam = url.searchParams.get('range') ?? 'thisMonth';

  if (!chartParam || !VALID_CHARTS.includes(chartParam as ChartKey)) {
    return NextResponse.json({ error: 'Invalid chart' }, { status: 400 });
  }
  if (!VALID_RANGES.includes(rangeParam as DateRangeKey)) {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  const config = getDateRangeConfig(rangeParam as DateRangeKey);
  const { range, bucketStrategy } = config;
  const buckets = generateBuckets(range, bucketStrategy);

  let data: unknown;

  switch (chartParam as ChartKey) {
    case 'users':
      data = await fetchUsersSeriesForRange(range, buckets, bucketStrategy);
      break;
    case 'products':
      data = await fetchProductsSeriesForRange(range, buckets, bucketStrategy);
      break;
    case 'categoryPie':
      data = await fetchCategoryForRange(range);
      break;
    case 'customerMold': {
      const [rate, { count: moldCount }] = await Promise.all([
        fetchCustomerMoldRateForRange(range),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', range.startISO)
          .lt('created_at', range.endISO)
          .eq('has_customer_mold', true),
      ]);
      data = { rate, moldCount: moldCount ?? 0 };
      break;
    }
  }

  return NextResponse.json({ data, timeLabel: config.timeLabel });
}
