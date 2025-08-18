'use client';

import React, { useMemo } from 'react';
import AreaChart from './AreaChart';
import type { ChartRow } from '@/types/chart';

type MonthlyRequestsChartProps = {
  rows: ChartRow[];
  monthsToShow?: number;
};

export default function MonthlyRequestsChart({ rows, monthsToShow = 3 }: MonthlyRequestsChartProps) {
  const { xData, series } = useMemo(() => {
    const now = new Date(); // ← NOW inside useMemo

    // build month keys for last `monthsToShow` months (inclusive current month)
    const months: string[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); // YYYY-MM
    }

    // initialize totals
    const totals = Object.fromEntries(months.map(m => [m, 0])) as Record<string, number>;

    // accumulate safely
    for (const r of rows) {
      const created = r?.created_at;
      if (!created) continue;
      const d = new Date(created);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in totals) totals[key]++;
    }

    const xData = months;
    const series = [
      {
        data: xData.map((m) => totals[m] ?? 0),
        label: 'Toplam Talepler',
      },
    ];

    return { xData, series };
  }, [rows, monthsToShow]); // stable deps

  return <AreaChart xData={xData} series={series} />;
}
