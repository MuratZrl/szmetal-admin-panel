'use client';

import CustomBarChart from './BarChart';
import useUserStatusStats from '../../../app/(admin)/hooks/useUserStatusStats';

export default function GroupedBarChart() {
  const { data, loading } = useUserStatusStats();

  if (loading) return <p>Yükleniyor...</p>;
  if (!data.length) return <p>Veri bulunamadı.</p>;

  const statuses = ['active', 'inactive', 'banned'];

  const colorMap: Record<string, string> = {
    active: 'green',   // mavi
    inactive: 'orangered', // turuncu
    banned: '#8a170fff',   // kırmızı
  };

  // Ayları sırala
  const months = [...new Set(data.map((item) => item.month))];

  const getCountsByStatus = (status: string) =>
    months.map((month) => {
      const item = data.find(
        (d) => d.month === month && d.status.toLowerCase() === status
      );
      return item ? item.count : 0;
    });

  const series = statuses.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    data: getCountsByStatus(status),
    color: colorMap[status], // ✅ RENK EKLENDİ
  }));

  return (
    <CustomBarChart
      xData={months}
      series={series}
      height={300}
    />
  );
}
