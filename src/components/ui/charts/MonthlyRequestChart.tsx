'use client';

import React, { useMemo, useId } from 'react';
import { useTheme } from '@mui/material/styles';
import AreaChart from './AreaChart';
import type { ChartRow } from '@/types/chart';

type MonthlyRequestsChartProps = {
  rows: ChartRow[];
  monthsToShow?: number;
};

export default function MonthlyRequestsChart({ rows, monthsToShow = 3 }: MonthlyRequestsChartProps) {
  const theme = useTheme();
  const gid = useId().replace(/:/g, ''); // benzersiz gradient id

  const { xData, series } = useMemo(() => {
    const now = new Date();

    const months: string[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const totals = Object.fromEntries(months.map(m => [m, 0])) as Record<string, number>;
    for (const r of rows) {
      const created = r?.created_at;
      if (!created) continue;
      const d = new Date(created);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in totals) totals[key]++;
    }

    return {
      xData: months,
      series: [
        {
          data: months.map((m) => totals[m] ?? 0),
          label: 'Toplam Talepler',
          // area chart’ta çizgi rengini bozmadan sadece alanı boyamak için fill’i sx ile override edeceğiz.
        },
      ],
    };
  }, [rows, monthsToShow]);

  return (
    <AreaChart
      xData={xData}
      series={series}
      // Area path'ini gradient ile doldur
      sx={{ '& .MuiAreaElement-root': { fill: `url(#${gid})` } }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          {/* üstte daha yoğun, altta daha şeffaf */}
          <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
          <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={0.95} />
        </linearGradient>
      </defs>
    </AreaChart>
  );
}
