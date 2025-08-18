'use client';

import React, { useMemo } from 'react';
import CustomBarChart from './BarChart';
import type { ChartRow } from '@/types/chart';

interface GroupedRequestedBarChartProps {
  rows: ChartRow[];
  monthsToShow?: number;
}

export default function GroupedRequestedBarChart({ rows, monthsToShow = 3 }: GroupedRequestedBarChartProps) {
  const { xData, series } = useMemo(() => {
    const now = new Date(); // ← NOW is inside useMemo

    // son `monthsToShow` ayı oluştur
    const months: string[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); // YYYY-MM
    }

    // default counts
    const dataByStatus: Record<string, Record<'pending' | 'approved' | 'rejected' | 'unknown', number>> = {};
    for (const m of months) {
      dataByStatus[m] = { pending: 0, approved: 0, rejected: 0, unknown: 0 };
    }

    // normalize ve accumulate
    for (const r of rows) {
      const created = r?.created_at;
      if (!created) continue;
      const d = new Date(created);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!dataByStatus[key]) continue;

      const rawStatus = (r.status ?? 'unknown').toString().trim().toLowerCase();
      const status = rawStatus === 'pending' ? 'pending'
                   : rawStatus === 'approved' || rawStatus === 'completed' || rawStatus === 'done' ? 'approved'
                   : rawStatus === 'rejected' || rawStatus === 'cancelled' || rawStatus === 'canceled' ? 'rejected'
                   : 'unknown';

      dataByStatus[key][status] = (dataByStatus[key][status] ?? 0) + 1;
    }

    const xData = months;

    const series = [
      { label: 'Bekleyen', data: xData.map(m => dataByStatus[m].pending), color: '#ffa000' },
      { label: 'Tamamlandı', data: xData.map(m => dataByStatus[m].approved), color: '#4caf50' },
      { label: 'İptal', data: xData.map(m => dataByStatus[m].rejected), color: '#f44336' },
    ];

    return { xData, series };
  }, [rows, monthsToShow]); // now removed from deps because it's inside useMemo

  return <CustomBarChart xData={xData} series={series} />;
}
