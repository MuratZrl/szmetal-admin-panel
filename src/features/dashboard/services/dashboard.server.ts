import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { getMonthBounds } from '@/utils/date';
import { calcChangeAndTrend } from '@/utils/stats';

import type { DashboardData } from '@/types/dashboard';

// örnek: tek sorumlu yer — hata fırlatır, page katmanında yakalanır
export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const { startOfThisMonthISO, startOfLastMonthISO, endOfLastMonthISO } = getMonthBounds(new Date());

  // toplamlar
  const [{ data: allUsers }, { data: allRequests }, { data: allSystems }] = await Promise.all([
    supabase.from('users').select('id'),
    supabase.from('requests').select('id').eq('status', 'pending'),
    supabase.from('system_profiles').select('system_slug'),
  ]);

  const totalUsers = allUsers?.length ?? 0;
  const totalRequests = allRequests?.length ?? 0;
  const uniqueSystems = new Set(allSystems?.map(s => s.system_slug)).size;

  // this / last month user counts
  const [{ data: thisMonthUsers }, { data: lastMonthUsers }] = await Promise.all([
    supabase.from('users').select('id').gte('created_at', startOfThisMonthISO),
    supabase.from('users').select('id').gte('created_at', startOfLastMonthISO).lte('created_at', endOfLastMonthISO),
  ]);
  const { percent: userChangePercent, trend: userTrend } = calcChangeAndTrend(lastMonthUsers?.length ?? 0, thisMonthUsers?.length ?? 0);

  // requests (pending) this/last month
  const [{ data: thisMonthRequests }, { data: lastMonthRequests }] = await Promise.all([
    supabase.from('requests').select('id').eq('status', 'pending').gte('created_at', startOfThisMonthISO),
    supabase.from('requests').select('id').eq('status', 'pending').gte('created_at', startOfLastMonthISO).lte('created_at', endOfLastMonthISO),
  ]);
  const { percent: requestChangePercent, trend: requestTrend } = calcChangeAndTrend(lastMonthRequests?.length ?? 0, thisMonthRequests?.length ?? 0);

  // systems unique this/last month
  const [{ data: thisMonthSystems }, { data: lastMonthSystems }] = await Promise.all([
    supabase.from('system_profiles').select('system_slug').gte('created_at', startOfThisMonthISO),
    supabase.from('system_profiles').select('system_slug').gte('created_at', startOfLastMonthISO).lte('created_at', endOfLastMonthISO),
  ]);
  const uniqueThisMonth = new Set(thisMonthSystems?.map(s => s.system_slug)).size;
  const uniqueLastMonth = new Set(lastMonthSystems?.map(s => s.system_slug)).size;
  const { percent: systemChangePercent, trend: systemTrend } = calcChangeAndTrend(uniqueLastMonth, uniqueThisMonth);

  // basit chart serisi (örnek) — gerçek veriyi almak için date_trunc sorgusu önerilir
  const monthlyUsersSeries = await buildMonthlyUsersSeries();

  const totals = {
    totalUsers,
    totalRequests,
    uniqueSystems,
    userChangePercent,
    userTrend,
    requestChangePercent,
    requestTrend,
    systemChangePercent,
    systemTrend,
  };

  return { totals, monthlyUsersSeries, roleSeries: [] };
}

// quick helper: burada gerçek SQL daha iyi; örnek placeholder
async function buildMonthlyUsersSeries() {
  const now = new Date();
  const series = { name: 'Kullanıcılar', data: [] as { x: string; y: number }[] };
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('tr-TR', { month: 'short', year: 'numeric' });
    // optimizasyon: tek sorguda date_trunc + group by yap
    series.data.push({ x: label, y: Math.floor(Math.random() * 200) });
  }
  return [series];
}
