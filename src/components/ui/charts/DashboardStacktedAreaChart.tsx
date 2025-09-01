'use client'
import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box } from '@mui/material';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../types/supabase';

// Supabase istemcisi
const supabase = createClientComponentClient<Database>();

// Her bir gün için status'lerin sayısı
type StatusStats = {
  date: Date;
  pending: number;
  approved: number;
  rejected: number;
};

export default function DashboardStackedAreaChart() {
  const [dataset, setDataset] = useState<StatusStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      const { data, error } = await supabase
        .from('requests')
        .select('status, created_at')
        .gte('created_at', threeMonthsAgo.toISOString());

      if (error || !data) {
        console.error('Supabase error:', error);
        return;
      }

      const grouped: Record<string, StatusStats> = {};

      data.forEach((req) => {
        const dateKey = new Date(req.created_at).toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: new Date(dateKey),
            pending: 0,
            approved: 0,
            rejected: 0,
          };
        }

        if (req.status === 'pending') grouped[dateKey].pending += 1;
        else if (req.status === 'approved') grouped[dateKey].approved += 1;
        else if (req.status === 'rejected') grouped[dateKey].rejected += 1;
      });

      const finalDataset = Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
      setDataset(finalDataset);
    };

    fetchData();
  }, []);

  return (
    <Box style={{ width: '100%' }}>
      <LineChart
        dataset={dataset}
        xAxis={[
          {
            id: 'date',
            dataKey: 'date',
            scaleType: 'time',
            valueFormatter: (date) => date.getDate() + '/' + (date.getMonth() + 1),
          },
        ]}
        yAxis={[{ width: 70 }]}
        series={[
          {
            id: 'pending',
            label: 'Bekleyen Talepler',
            dataKey: 'pending',
            stack: 'total',
            area: true,
            showMark: false,
          },
          {
            id: 'approved',
            label: 'Onaylanan Talepler',
            dataKey: 'approved',
            stack: 'total',
            area: true,
            showMark: false,
          },
          {
            id: 'rejected',
            label: 'Reddedilen Talepler',
            dataKey: 'rejected',
            stack: 'total',
            area: true,
            showMark: false,
          },
        ]}
        height={300}
        margin={{ top: 20, bottom: 30, left: 50, right: 20 }}
        experimentalFeatures={{ preferStrictDomainInLineCharts: true }}
        grid={{ horizontal: true, vertical: true }} // ✅ Grid çizgileri aktif!
      />
    </Box>
  );
}
