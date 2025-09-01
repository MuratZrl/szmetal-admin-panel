import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/supabaseClient';

interface MonthlyUserData {
  month: string;
  count: number;
}

export default function useMonthlyUserStats() {
  const [data, setData] = useState<MonthlyUserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthlyUsers() {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_monthly_user_counts_with_zeros');

      if (error) {
        console.error('Hata:', error.message);
      } else {
        setData(data);
      }

      setLoading(false);
    }

    fetchMonthlyUsers();
  }, []);

  return { data, loading };
}
