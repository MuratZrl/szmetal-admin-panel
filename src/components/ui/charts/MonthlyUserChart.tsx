'use client';

import AreaChart from './AreaChart';

import useMonthlyUserStats from '@/features/dashboard/hooks/useMonthlyUserStats.client';

export default function MonthlyUserChart() {
  const { data, loading } = useMonthlyUserStats();

  if (loading) return <p>Yükleniyor...</p>;
  if (!data.length) return <p>Veri bulunamadı.</p>;

  const xLabels = data.map((item) => item.month);   // ['2024-06', '2024-07', ...]
  const yValues = data.map((item) => item.count);   // [12, 34, 50, ...]

  return (
    <AreaChart
      xData={xLabels}
      series={[
        {
          data: yValues,
          label: 'Toplam Kullanıcılar',
          color: 'orangered',
        },
      ]}
      height={300}
    />
  );
}
