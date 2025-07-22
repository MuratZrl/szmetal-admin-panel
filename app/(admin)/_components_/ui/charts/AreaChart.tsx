'use client';

import { LineChart } from '@mui/x-charts/LineChart';

interface AreaChartProps {
  xData: number[] | string[];
  series: {
    data: number[];
    label?: string;
    color?: string;
  }[];
  height?: number;
}

export default function AreaChart({
  xData,
  series,
  height = 300,
}: AreaChartProps) {
  return (
    <LineChart
      xAxis={[{ data: xData, scaleType: 'band' }]} // <-- EKLENDİ
      series={series.map((s) => ({
        ...s,
        area: true,
        color: s.color || '#1976d2', // Varsayılan renk
      }))}
      height={height}
    />
  );
}
