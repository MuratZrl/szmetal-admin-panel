// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { getDateRangeConfig } from '@/features/dashboard/utils/dateRanges';
import { fetchDashboardDataForRange } from '@/features/dashboard/services/dashboardchart.server';
import type { DateRangeKey } from '@/features/dashboard/types/dashboardData';

const VALID_RANGES: DateRangeKey[] = ['today', 'thisWeek', 'thisMonth', 'thisYear', 'lastYear', 'allTime'];

export async function GET(req: Request) {
  // 1) Auth check
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2) Parse & validate range param
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get('range') ?? 'thisMonth';
  if (!VALID_RANGES.includes(rangeParam as DateRangeKey)) {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  // 3) Fetch data for range
  const config = getDateRangeConfig(rangeParam as DateRangeKey);
  const payload = await fetchDashboardDataForRange(config);

  return NextResponse.json(payload);
}
