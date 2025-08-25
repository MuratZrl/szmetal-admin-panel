'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';
import { getMonthBounds } from '@/utils/date';
import { calcChangeAndTrend } from '@/utils/stats';

type User = Database['public']['Tables']['users']['Row'];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [thisMonthUsers, setThisMonthUsers] = useState<User[]>([]);
  const [lastMonthUsers, setLastMonthUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { startOfThisMonth, startOfLastMonth, endOfLastMonth } = getMonthBounds(new Date());

      const [{ data: allUsers, error: allError }, { data: thisM, error: thisError }, { data: lastM, error: lastError }] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('users').select('*').gte('created_at', startOfThisMonth.toISOString()),
        supabase
          .from('users')
          .select('*')
          .gte('created_at', startOfLastMonth.toISOString())
          .lte('created_at', endOfLastMonth.toISOString()),
      ]);

      if (allError || thisError || lastError) {
        throw allError ?? thisError ?? lastError;
      }

      setUsers(allUsers ?? []);
      setThisMonthUsers(thisM ?? []);
      setLastMonthUsers(lastM ?? []);
    } catch (err) {
      setError(err as Error);
      console.error('useUsers fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => (u.status ?? '').toLowerCase() === 'active').length;
    const passiveUsers = users.filter(u => (u.status ?? '').toLowerCase() === 'inactive').length;
    const bannedUsers = users.filter(u => (u.status ?? '').toLowerCase() === 'banned').length;

    const { percent: totalChange, trend: totalTrend } = calcChangeAndTrend(lastMonthUsers.length, thisMonthUsers.length);
    const { percent: activeChange, trend: activeTrend } = calcChangeAndTrend(
      lastMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'active').length,
      thisMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'active').length
    );
    const { percent: passiveChange, trend: passiveTrend } = calcChangeAndTrend(
      lastMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'inactive').length,
      thisMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'inactive').length
    );
    const { percent: bannedChange, trend: bannedTrend } = calcChangeAndTrend(
      lastMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'banned').length,
      thisMonthUsers.filter(u => (u.status ?? '').toLowerCase() === 'banned').length
    );

    return {
      totalUsers,
      activeUsers,
      passiveUsers,
      bannedUsers,
      thisMonthTotal: thisMonthUsers.length,
      lastMonthTotal: lastMonthUsers.length,
      totalChange,
      totalTrend,
      activeChange,
      activeTrend,
      passiveChange,
      passiveTrend,
      bannedChange,
      bannedTrend,
    };
  }, [users, thisMonthUsers, lastMonthUsers]);

  return {
    users,
    loading,
    error,
    totals,
    refresh: fetch,
  } as const;
}
