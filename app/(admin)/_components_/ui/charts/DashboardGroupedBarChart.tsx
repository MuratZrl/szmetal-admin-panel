'use client';

import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Database } from '../../../../../types/supabase';

export default function BasicBars() {
  const supabase = createClientComponentClient<Database>();

  const [months, setMonths] = useState<string[]>([]);
  const [series, setSeries] = useState<{ label: string; data: number[] }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const monthData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          label: d.toLocaleString('tr-TR', { month: 'short' }),
          start: new Date(d.getFullYear(), d.getMonth(), 1),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
        };
      }).reverse();

      setMonths(monthData.map((m) => m.label));

      const startDate = monthData[0].start.toISOString();

      const { data: users, error } = await supabase
        .from('users')
        .select('created_at, role')
        .gte('created_at', startDate);

      if (error) {
        console.error('Veri alınamadı:', error);
        return;
      }

      const roles = Array.from(new Set(users?.map(u => u.role).filter(Boolean)));

      const colorPalette = ['darkred', 'purple'];

      const grouped = roles.map((role, i) => {
        const data = monthData.map(({ start, end }) => {
          return users?.filter((u) => {
            if (!u.created_at || !u.role) return false;
            const created = new Date(u.created_at);
            return u.role === role && created >= start && created < end;
          }).length || 0;
        });

        return {
          label: role,
          data,
          color: colorPalette[i % colorPalette.length], // 🔥 Renk tanımı burada
        };
      });

      setSeries(grouped);
    };

    fetchData();
  }, [supabase]);

  return (
    <BarChart
      height={300}
      xAxis={[{ data: months }]}
      series={series} // her biri color içeriyor
      grid={{ horizontal: true, vertical: true }}
    />
  );
}
