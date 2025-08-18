import { useEffect, useState } from 'react';

import { supabase } from '../../../lib/supabase/supabaseClient';

interface StatusStat {
  month: string;
  status: 'Active' | 'Inactive' | 'Banned';
  count: number;
}

export default function useUserStatusStats() {
  const [data, setData] = useState<StatusStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_monthly_user_status_counts_with_zeros');

      if (error) {
        console.error('Hata:', error.message);
      } else {
        setData(data);
      }

      setLoading(false);
    }

    fetchStats();
  }, []);

  return { data, loading };
}
