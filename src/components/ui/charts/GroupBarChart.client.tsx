'use client';

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type GroupSeries = { label: string; data: number[]; color?: string };

type PaletteName = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

type Props = {
  labels: string[];
  series: GroupSeries[];
  height?: number;
  title?: string;

  /** Etikete göre palet anahtarı veya direkt CSS rengi atamak için */
  colorKeyByLabel?: Partial<Record<string, PaletteName | string>>;
  /** Renk tonu: 'solid' direkt ana rengi, 'soft' pastel verir */
  tone?: 'solid' | 'soft';
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

function isPaletteName(v: unknown): v is PaletteName {
  return v === 'primary' || v === 'secondary' || v === 'info' || v === 'success' || v === 'warning' || v === 'error';
}

export default function GroupBarChart({
  labels,
  series,
  height = 320,
  title,
  colorKeyByLabel,
  tone = 'solid',
}: Props) {
  const theme = useTheme();

  if (!labels.length || !series.length) {
    return (
      <Box
        sx={{
          height,
          display: 'grid',
          placeItems: 'center',
          border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
          borderRadius: 1.5,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Görselleştirilecek veri bulunamadı.
        </Typography>
      </Box>
    );
  }

  // Tema ile uyumlu palet sırası (seriler biterse döngü)
  const paletteOrder: PaletteName[] = ['primary', 'info', 'success', 'warning', 'error', 'secondary'];

  const baseColors = series.map((s, i) => {
    // 1) Öncelik: colorKeyByLabel → palet adı veya doğrudan renk
    const mapped = colorKeyByLabel?.[s.label];
    if (typeof mapped === 'string') {
      if (isPaletteName(mapped)) return theme.palette[mapped].main;
      // css rengi (#rrggbb, rgb(), hsl() vs.)
      return mapped;
    }

    // 2) Seri üstünden direkt renk
    if (typeof s.color === 'string' && s.color.trim().length > 0) {
      return s.color;
    }

    // 3) Sıraya göre tema paletinden seç
    const key = paletteOrder[i % paletteOrder.length];
    return theme.palette[key].main;
  });

  const resolvedColors =
    tone === 'soft'
      ? baseColors.map((c) => alpha(c, theme.palette.mode === 'dark' ? 0.6 : 0.25))
      : baseColors;

  // X-Charts, colors dizisini sırayla serilere atar
  return (
    <Box>
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}
      <BarChart
        xAxis={[
          {
            data: labels,
            scaleType: 'band',
            tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary },
          },
        ]}
        series={series.map((s) => ({
          label: s.label,
          data: s.data,
          // color vermiyoruz; colors[] kullanılacak
          valueFormatter: (v) => formatTR(v ?? 0),
        }))}
        colors={resolvedColors}
        grid={{ horizontal: true, vertical: false }}
        height={height}
        margin={{ top: 8, right: 8, bottom: 32, left: 8 }}
        slotProps={{ legend: { position: { vertical: 'top' } } }}
        sx={{
          '.MuiChartsGrid-line': {
            strokeDasharray: '3 3',
            stroke: alpha(theme.palette.text.primary, 0.15),
          },
          '.MuiChartsAxis-line': { stroke: theme.palette.divider },
          '.MuiBarElement-root': {
            rx: 4,
            transition: 'opacity 120ms ease, transform 120ms ease',
          },
          '.MuiBarElement-root:hover': {
            opacity: theme.palette.mode === 'dark' ? 0.9 : 0.95,
          },
        }}
      />
    </Box>
  );
}
