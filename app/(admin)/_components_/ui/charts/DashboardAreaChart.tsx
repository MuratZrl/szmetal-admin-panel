'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../../../types/supabase';

type MonthlyCount = {
  label: string;
  count: number;
};

export default function BasicArea() {
  const [data, setData] = useState<MonthlyCount[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();

      // Son 6 ay için başlangıç ve bitişleri hazırla
      const months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          label: d.toLocaleString('tr-TR', { month: 'short' }),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
        };
      }).reverse(); // eskiden yeniye sırala

      // İlk ayın başından itibaren kullanıcıları çek
      const firstStart = new Date(months[0].end);
      firstStart.setMonth(firstStart.getMonth() - 1); // önceki ayın sonu = ilk ayın başı

      const { data: users, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', firstStart.toISOString());

      if (error) {
        console.error('Veri alınamadı:', error);
        return;
      }

      const cumulative = months.map(({ label, end }) => {
        const count = users?.filter((u) => {
          if (!u.created_at) return false;
          return new Date(u.created_at) < end;
        }).length ?? 0;

        return { label, count };
      });

      setData(cumulative);
    };

    fetchData();
  }, [supabase]);

  return (
    <Box position="relative">
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="orangered" />
            <stop offset="100%" stopColor="darkred" />
          </linearGradient>
        </defs>
      </svg>

      <LineChart
        height={300}
        xAxis={[{ data: data.map((c) => c.label), scaleType: 'band' }]}
        series={[
          {
            type: 'line',
            label: 'Toplam Kullanıcılar',
            data: data.map((c) => c.count),
            area: true,
            showMark: false,
            color: 'url(#gradient)',
          },
        ]}
        grid={{ horizontal: true, vertical: true }}
      />
    </Box>
  );
}
