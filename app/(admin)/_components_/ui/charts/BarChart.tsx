'use client';

import { BarChart } from '@mui/x-charts/BarChart';

interface BarChartProps {
  xData: string[];
  series: {
    data: number[];
    label: string;
    color?: string;
  }[];
  height?: number;
}

export default function CustomBarChart({
  xData,
  series,
  height = 300,
}: BarChartProps) {
  return (
    <BarChart
      xAxis={[{ data: xData, scaleType: 'band' }]} // <-- scaleType ÖNEMLİ
      series={series.map((s) => ({
        ...s,
        color: s.color || undefined, // özel renk varsa uygula
      }))}
      height={height}
      
    />
  );
}
