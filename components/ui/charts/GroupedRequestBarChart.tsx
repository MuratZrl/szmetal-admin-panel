'use client';

import CustomBarChart from './BarChart';

import { RequestRowUnion } from '../../../app/(admin)/types/requestsTypes';

interface GroupedRequestedBarChartProps {
  rows: RequestRowUnion[];
}

export default function GroupedRequestedBarChart({ rows }: GroupedRequestedBarChartProps) {
  const now = new Date();
  const last3Months: string[] = [];

  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    last3Months.push(key);
  }

  const dataByStatus: Record<string, { pending: number; approved: number; rejected: number }> = {};
  last3Months.forEach((m) => {
    dataByStatus[m] = { pending: 0, approved: 0, rejected: 0 };
  });

  rows.forEach((r) => {
    const date = new Date(r.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (last3Months.includes(key)) {
      if (r.status === 'pending') dataByStatus[key].pending++;
      if (r.status === 'approved') dataByStatus[key].approved++;
      if (r.status === 'rejected') dataByStatus[key].rejected++;
    }
  });

  const xData = last3Months;

  const series = [
    {
      label: 'Bekleyen',
      data: xData.map((m) => dataByStatus[m].pending),
      color: '#ffa000',
    },
    {
      label: 'Tamamlandı',
      data: xData.map((m) => dataByStatus[m].approved),
      color: '#4caf50',
    },
    {
      label: 'İptal',
      data: xData.map((m) => dataByStatus[m].rejected),
      color: '#f44336',
    },
  ];

  return <CustomBarChart xData={xData} series={series} />;
}
