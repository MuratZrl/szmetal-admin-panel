'use client';
// src/components/ui/charts/MiniSparkline.client.tsx

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useTheme } from '@mui/material/styles';

type Props = {
  data: number[];
  height?: number;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
};

// Theme-aware sparkline colors: brighter for dark, deeper for light
const SPARK_COLORS: Record<string, { dark: string; light: string }> = {
  primary: { dark: '#64B5F6', light: '#1565C0' },
  success: { dark: '#66BB6A', light: '#2E7D32' },
  info:    { dark: '#4DD0E1', light: '#00838F' },
  warning: { dark: '#FFB74D', light: '#E67E22' },
  error:   { dark: '#EF5350', light: '#C62828' },
};

export default function MiniSparkline({
  data,
  height = 50,
  color = 'primary',
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const palette = SPARK_COLORS[color] ?? SPARK_COLORS.primary;
  const lineColor = isDark ? palette.dark : palette.light;

  if (!data.length) return null;

  return (
    <SparkLineChart
      data={data}
      height={height}
      curve="natural"
      area
      color={lineColor}
      sx={{
        '.MuiAreaElement-root': {
          fillOpacity: isDark ? 0.2 : 0.15,
        },
        '.MuiLineElement-root': {
          strokeWidth: 2.5,
        },
      }}
    />
  );
}
