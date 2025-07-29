'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
} from '@mui/x-charts/BarChart';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../../../types/supabase';

import { Box, Stack } from '@mui/material';

export default function StackedSystemBarChart() {
  const supabase = createClientComponentClient<Database>();

  const [months, setMonths] = useState<string[]>([]);
  const [series, setSeries] = useState<
    { id: string; label: string; data: number[]; stack: string }[]
  >([]);

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

      const { data: requests, error } = await supabase
        .from('requests')
        .select('created_at, system_slug')
        .gte('created_at', startDate);

      if (error) {
        console.error('Veri alınamadı:', error);
        return;
      }

      const systems = Array.from(new Set(requests?.map(r => r.system_slug).filter(Boolean)));

      const grouped = systems.map((slug) => {
        const data = monthData.map(({ start, end }) =>
          requests?.filter((r) => {
            if (!r.created_at || !r.system_slug) return false;
            const created = new Date(r.created_at);
            return r.system_slug === slug && created >= start && created < end;
          }).length || 0
        );

        return {
          id: slug,
          label: slug,
          data,
          stack: 'total', // 📌 stacked görünüm
        };
      });

      setSeries(grouped);
    };

    fetchData();
  }, [supabase]);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <BarChart
          height={300}
          xAxis={[{ id: 'months', data: months }]}
          series={series}
          grid={{ horizontal: true }}
        />
      </Box>

    </Stack>
  );
}
