// src/components/ui/charts/GroupBarChart.client.tsx
'use client';

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type GroupSeries = { label: string; data: number[]; color?: string };

type Props = {
  labels: string[];
  series: GroupSeries[];
  height?: number;
  title?: string;
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

export default function GroupBarChart({ labels, series, height = 320, title }: Props) {
  const theme = useTheme();
  if (!labels.length || !series.length) {
    return (
      <Box sx={{ height, display: 'grid', placeItems: 'center', border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`, borderRadius: 1.5 }}>
        <Typography variant="body2" color="text.secondary">Görselleştirilecek veri bulunamadı.</Typography>
      </Box>
    );
  }

  const palette = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.secondary?.main ?? theme.palette.text.primary,
  ];

  const resolved = series.map((s, i) => ({
    ...s,
    color: s.color ?? palette[i % palette.length],
  }));

  return (
    <Box>
      {title && <Typography variant="h6" mb={1}>{title}</Typography>}
      <BarChart
        xAxis={[{ data: labels, scaleType: 'band', tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary } }]}
        series={resolved.map(s => ({
          label: s.label,
          data: s.data,
          color: s.color,
          valueFormatter: v => formatTR(v ?? 0),
        }))}
        grid={{ horizontal: true, vertical: false }}
        height={height}
        margin={{ top: 8, right: 8, bottom: 32, left: 8 }}
        slotProps={{ legend: { position: { vertical: 'top' } } }}
        sx={{
          '.MuiChartsGrid-line': { strokeDasharray: '3 3', stroke: alpha(theme.palette.text.primary, 0.15) },
          '.MuiChartsAxis-line': { stroke: theme.palette.divider },
          '.MuiBarElement-root': { rx: 4 }, // hafif radius, daha modern
        }}
      />
    </Box>
  );
}
