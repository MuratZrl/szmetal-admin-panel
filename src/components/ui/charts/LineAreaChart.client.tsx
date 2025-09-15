// src/components/ui/charts/LineAreaChart.client.tsx
'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type ChartCurve = 'linear' | 'monotoneX' | 'natural' | 'step' | 'catmullRom';

// 🎯 Yeni: semantic renk anahtarı desteği
export type SemanticColorKey = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export type LineSeries = {
  label: string;
  data: number[];
  area?: boolean;
  color?: string;            // doğrudan hex/rgb
  colorKey?: SemanticColorKey; // tema paletinden al
  showMark?: boolean;
  valueSuffix?: string;
  curve?: ChartCurve;
};

type Props = {
  labels: string[];
  series: LineSeries[];
  height?: number;
  title?: string;
  grid?: { horizontal?: boolean; vertical?: boolean };
  tickLabelFontSize?: number;
  emptyText?: string;
  yValueFormatter?: (v: number) => string;
  areaOpacity?: number;
};

function formatNumberTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

// 🔎 Etiketten statüyü çöz (TR ve EN destekli)
function normalizeStatusLabel(label: string): 'pending' | 'approved' | 'rejected' | null {
  const s = label.toLowerCase().trim();
  if (['pending', 'bekleyen', 'beklemede', 'beklemede', 'beklemede'].includes(s)) return 'pending';
  if (['approved', 'kabul', 'onaylandı', 'onayli', 'onayli̇', 'onay'].includes(s)) return 'approved';
  if (['rejected', 'reddedilen', 'reddedildi', 'ret', 'red'].includes(s)) return 'rejected';
  return null;
}

export default function LineAreaChart({
  labels,
  series,
  height = 320,
  title,
  grid = { horizontal: true, vertical: false },
  tickLabelFontSize = 12,
  emptyText = 'Görselleştirilecek veri bulunamadı.',
  yValueFormatter = formatNumberTR,
  areaOpacity,
}: Props) {
  const theme = useTheme();

  if (!series.length || !labels.length) {
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
          {emptyText}
        </Typography>
      </Box>
    );
  }

  const minLenAcross = Math.min(labels.length, ...series.map(s => s.data.length));
  if (minLenAcross === 0) {
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
          {emptyText}
        </Typography>
      </Box>
    );
  }

  const safeLabels = labels.slice(0, minLenAcross);
  const safeSeries = series.map(s => ({
    ...s,
    data: s.data.slice(0, minLenAcross).map(v => (Number.isFinite(v) ? v : 0)),
  }));

  // 🎨 Varsayılan palet: TURUNCU ÖNCE
  const autoColors = [
    theme.palette.warning.main,  // ← turuncu ilk
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.secondary?.main ?? theme.palette.text.primary,
  ];

  // 🧠 Statü bazlı renk önceliği
  function resolveColor(s: LineSeries, index: number): string {
    // 1) Direkt color verilmişse onu kullan
    if (s.color) return s.color;

    // 2) Semantic colorKey verilmişse temadan al
    if (s.colorKey) return theme.palette[s.colorKey].main;

    // 3) Etiketten statüyü yakala ve sabitle
    const norm = normalizeStatusLabel(s.label);
    if (norm === 'pending')  return theme.palette.warning.main;
    if (norm === 'approved') return theme.palette.success.main;
    if (norm === 'rejected') return theme.palette.error.main;

    // 4) Aksi halde otomatik palet
    return autoColors[index % autoColors.length];
  }

  const resolvedSeries = safeSeries.map((s, i) => ({
    ...s,
    color: resolveColor(s, i),
  }));

  const resolvedAreaOpacity =
    typeof areaOpacity === 'number'
      ? areaOpacity
      : theme.palette.mode === 'dark'
      ? 0.22
      : 0.16;

  return (
    <Box>
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}

      <LineChart
        xAxis={[
          {
            data: safeLabels,
            scaleType: 'point',
            tickLabelStyle: { fontSize: tickLabelFontSize, fill: theme.palette.text.secondary },
          },
        ]}
        series={resolvedSeries.map(s => ({
          label: s.label,
          data: s.data,
          area: s.area ?? true,
          curve: s.curve ?? 'monotoneX',
          showMark: s.showMark ?? true,
          color: s.color, // artık her serinin rengi çözümlendi
          valueFormatter: (v: number | null) => `${yValueFormatter(v ?? 0)}${s.valueSuffix ?? ''}`,
        }))}
        grid={{ horizontal: !!grid.horizontal, vertical: !!grid.vertical }}
        height={height}
        slotProps={{ tooltip: { trigger: 'axis' } }}
        sx={{
          '.MuiAreaElement-root': {
            fillOpacity: resolvedAreaOpacity,
            transition: 'fill-opacity 160ms ease',
          },
          '.MuiLineElement-root': { strokeWidth: 2.25 },
          '.MuiMarkElement-root': {
            r: 3.2,
            strokeWidth: 1.5,
            stroke: theme.palette.background.paper,
          },
          '.MuiMarkElement-root:hover': { r: 4 },
          '.MuiChartsGrid-line': {
            strokeDasharray: '3 3',
            stroke: alpha(theme.palette.text.primary, 0.15),
          },
          '.MuiChartsAxis-line': { stroke: theme.palette.divider },
        }}
      />
    </Box>
  );
}
