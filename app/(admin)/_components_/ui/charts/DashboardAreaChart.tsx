'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';

import { LineChart } from '@mui/x-charts/LineChart';
import { Box } from '@mui/material';

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
    const fetchLast6Months = async () => {
      const now = new Date();
      const months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          label: d.toLocaleString('tr-TR', { month: 'short' }),
          start: new Date(d.getFullYear(), d.getMonth(), 1),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
        };
      }).reverse();

      const startDate = months[0].start.toISOString();

      const { data: users, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate);

      if (error) {
        console.error('Veri alınamadı:', error);
        return;
      }

      const grouped = months.map(({ label, start, end }) => {
        const count = users?.filter((u) => {
          if (!u.created_at) return false; // null ise geç
          const created = new Date(u.created_at!); // non-null assertion
          return created >= start && created < end;
        }).length || 0;

        return { label, count };
      });

      setData(grouped);
    };

    fetchLast6Months();
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
            label: 'Yeni Kullanıcılar',
            data: data.map((c) => c.count),
            area: true,
            showMark: false,
            color: 'url(#gradient)', // 🔥 gradient burada uygulanır
          },
        ]}
        grid={{ horizontal: true, vertical: true }}
      />
      
    </Box>
  );
}