// src/components/features/requests/RequestStats.tsx
'use client';
import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard';
import type { RequestsStatsProps } from '@/types/requests';

type Trend = 'up' | 'down' | undefined;

export default function RequestStats({ rows }: RequestsStatsProps) {
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const {
    total,
    currentMonthCount,
    pendingCount,
    totalTrend,
    totalPercentage,
    percentage,
    trend,
    pendingPercentage,
    pendingTrend,
  } = useMemo(() => {
    const total = rows.length;

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let currentMonthCount = 0;
    let lastMonthCount = 0;
    let lastMonthPendingCount = 0;
    let pendingCount = 0;

    for (const r of rows) {
      // güvenlik: created_at bazen null/undefined/invalid olabilir
      if (!r.created_at) continue;
      const d = new Date(r.created_at);
      if (isNaN(d.getTime())) continue;

      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) currentMonthCount++;
      if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) lastMonthCount++;
      if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth && r.status === 'pending') lastMonthPendingCount++;
      if (r.status === 'pending') pendingCount++;
    }

    const totalTrend: Trend = total >= lastMonthCount ? 'up' : 'down';
    const totalPercentage = lastMonthCount === 0 ? 100 : Math.abs(Math.round(((total - lastMonthCount) / lastMonthCount) * 100));

    const trend: Trend = currentMonthCount >= lastMonthCount ? 'up' : 'down';
    const percentage = lastMonthCount === 0 ? 100 : Math.abs(Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100));

    const pendingTrend: Trend = pendingCount >= lastMonthPendingCount ? 'up' : 'down';
    const pendingPercentage = lastMonthPendingCount === 0 ? 100 : Math.abs(Math.round(((pendingCount - lastMonthPendingCount) / lastMonthPendingCount) * 100));

    // sadece gerçekten kullanacağımız değerleri döndürüyoruz
    return {
      total,
      currentMonthCount,
      pendingCount,
      totalTrend,
      totalPercentage,
      percentage,
      trend,
      pendingPercentage,
      pendingTrend,
    };
  }, [rows, currentMonth, currentYear]);

  return (
    <Grid container spacing={2} mb={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard title="Toplam Talep" value={total} trend={totalTrend} percentage={totalPercentage} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard title="Bu Ay Toplam Talepler" value={currentMonthCount} trend={trend} percentage={percentage} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard title="Bu Ay Bekleyen Talepler" value={pendingCount} trend={pendingTrend} percentage={pendingPercentage} />
      </Grid>
    </Grid>
  );
}
