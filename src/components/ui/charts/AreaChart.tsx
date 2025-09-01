// src/.../AreaChart.tsx
'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
  xData: string[];
  series: { data: number[]; label: string }[];
  height?: number;
  sx?: SxProps<Theme>;
  children?: React.ReactNode; // ← önemli: gradient defs için
};

export default function AreaChart({ xData, series, height = 300, sx, children }: Props) {
  return (
    <LineChart
      xAxis={[{ data: xData, scaleType: 'point' }]}
      series={series.map(s => ({ ...s, area: true, showMark: false }))}
      height={height}
      sx={sx}
    >
      {children} {/* ← gradient burada enjekte edilecek */}
    </LineChart>
  );
}
