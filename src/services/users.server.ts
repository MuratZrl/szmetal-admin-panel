// services/users.server.ts (veya hangi dosyada isen)
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { ClientTotals } from '@/types/clients';
import { getMonthBounds } from '@/utils/date';
import { calcChangeAndTrend } from '@/utils/stats';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export async function getUsersAndTotals(): Promise<{ users: User[]; totals: ClientTotals }> {
  const supabase = await createSupabaseServerClient();
  const { startOfThisMonthISO, startOfLastMonthISO, endOfLastMonthISO } = getMonthBounds(new Date());

  const [
    { data: allUsers, error: allErr },
    { data: thisMonthUsers, error: thisErr },
    { data: lastMonthUsers, error: lastErr },
  ] = await Promise.all([
    supabase.from('users').select('*'),                 // typed from Database
    supabase.from('users').select('*').gte('created_at', startOfThisMonthISO),
    supabase.from('users').select('*').gte('created_at', startOfLastMonthISO).lte('created_at', endOfLastMonthISO),
  ]);

  if (allErr || thisErr || lastErr) {
    // Hataları logla / handle et; istersen daha nazik bir error fırlat
    console.error('Supabase users query errors', { allErr, thisErr, lastErr });
    throw new Error(allErr?.message ?? thisErr?.message ?? lastErr?.message ?? 'Supabase users query failed');
  }

  const users = allUsers ?? [];
  const totalUsers = users.length;

  // Tipli filtreler — artık `any` yok
  const activeUsers = users.filter((u: User) => (u.status ?? '').toLowerCase() === 'active').length;
  const passiveUsers = users.filter((u: User) => (u.status ?? '').toLowerCase() === 'inactive').length;
  const bannedUsers = users.filter((u: User) => (u.status ?? '').toLowerCase() === 'banned').length;

  const { percent: totalChange, trend: totalTrend } = calcChangeAndTrend(lastMonthUsers?.length ?? 0, thisMonthUsers?.length ?? 0);

  const { percent: activeChange, trend: activeTrend } = calcChangeAndTrend(
    (lastMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'active').length,
    (thisMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'active').length
  );

  const { percent: passiveChange, trend: passiveTrend } = calcChangeAndTrend(
    (lastMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'inactive').length,
    (thisMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'inactive').length
  );

  const { percent: bannedChange, trend: bannedTrend } = calcChangeAndTrend(
    (lastMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'banned').length,
    (thisMonthUsers ?? []).filter((u: User) => (u.status ?? '').toLowerCase() === 'banned').length
  );

  const totals: ClientTotals = {
    totalUsers,
    activeUsers,
    passiveUsers,
    bannedUsers,
    thisMonthTotal: (thisMonthUsers ?? []).length,
    lastMonthTotal: (lastMonthUsers ?? []).length,
    totalChange,
    totalTrend,
    activeChange,
    activeTrend,
    passiveChange,
    passiveTrend,
    bannedChange,
    bannedTrend,
  };

  return { users: users ?? [], totals };
}
