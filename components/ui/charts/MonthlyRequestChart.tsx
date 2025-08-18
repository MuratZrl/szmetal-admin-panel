'use client';

import AreaChart from './AreaChart';
import { RequestRowUnion } from '../../../app/(admin)/types/requestsTypes';

interface MonthlyRequestsChartProps {
  rows: RequestRowUnion[];
}

export default function MonthlyRequestsChart({ rows }: MonthlyRequestsChartProps) {
  const now = new Date();
  const months: string[] = [];

  // ✅ Son 3 ayı oluştur
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // örn: "2025-03"
    months.push(key);
  }

  // ✅ Her ay için varsayılan 0 verisi oluştur
  const monthlyTotals: Record<string, number> = {};
  months.forEach((m) => {
    monthlyTotals[m] = 0;
  });

  // ✅ Gelen request verilerini bu aylara işle
  rows.forEach((r) => {
    const date = new Date(r.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyTotals.hasOwnProperty(key)) {
      monthlyTotals[key]++;
    }
  });

  const xData = months;
  const series = [
    {
      data: xData.map((m) => monthlyTotals[m]),
      label: 'Toplam Talepler',
    },
  ];

  return <AreaChart xData={xData} series={series} />;
}
