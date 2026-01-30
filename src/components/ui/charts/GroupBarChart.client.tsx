'use client';
// src/components/ui/charts/GroupBarChart.client.tsx

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme, alpha, type Theme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type GroupSeries = { label: string; data: number[]; color?: string };

// İki tip statü tokenını destekleyelim:
// - Uygulama kullanıcı statüsü: $status.Active | Inactive | Banned
// - Request statüsü: $requestStatus.pending | approved | rejected (.fg/.bg/.bd opsiyonel)
type AppStatus = 'Active' | 'Inactive' | 'Banned';
type RequestStatus = 'pending' | 'approved' | 'rejected';

type PaletteName = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
type StatusToken = `$status.${AppStatus}`;
type RequestStatusToken =
  | `$requestStatus.${RequestStatus}`
  | `$requestStatus.${RequestStatus}.fg`
  | `$requestStatus.${RequestStatus}.bg`
  | `$requestStatus.${RequestStatus}.bd`;

type Props = {
  labels: string[];
  series: GroupSeries[];
  height?: number;
  title?: string;
  /** Etikete göre palet anahtarı, semantik token veya direkt CSS rengi */
  colorKeyByLabel?: Partial<Record<string, PaletteName | StatusToken | RequestStatusToken | string>>;
  /** 'solid' ana renk, 'soft' pastel */
  tone?: 'solid' | 'soft';
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}
function isPaletteName(v: unknown): v is PaletteName {
  return v === 'primary' || v === 'secondary' || v === 'info' || v === 'success' || v === 'warning' || v === 'error';
}
function isStatusToken(v: string): v is StatusToken {
  return v.startsWith('$status.');
}
function isRequestStatusToken(v: string): v is RequestStatusToken {
  return v.startsWith('$requestStatus.');
}

function resolveToken(theme: Theme, token: PaletteName | StatusToken | RequestStatusToken | string | undefined, fallback: string): string {
  if (!token) return fallback;

  if (typeof token === 'string') {
    // 1) MUI palette anahtar adı
    if (isPaletteName(token)) return theme.palette[token].main;

    // 2) '$status.X' (varsa tema içinde)
    if (isStatusToken(token)) {
      const key = token.split('.')[1] as AppStatus;
      const col = (theme.palette)?.status?.[key] as string | undefined;
      if (col) return col;
    }

    // 3) '$requestStatus.x(.fg|.bg|.bd)'
    if (isRequestStatusToken(token)) {
      // $requestStatus.pending.bg -> ["$requestStatus","pending","bg"]
      const [, status, field] = token.split('.') as ['\$requestStatus', RequestStatus, 'fg' | 'bg' | 'bd' | undefined];
      const entry = (theme.palette)?.requestStatus?.[status] as { fg?: string; bg?: string; bd?: string } | undefined;
      const by = field ?? 'fg';
      const col = entry?.[by];
      if (col) return col;
    }

    // 4) Düz CSS rengi (#rrggbb, rgb(), hsl(), var(--...))
    return token;
  }

  return fallback;
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
    // 1) colorKeyByLabel → palet adı / $status.X / $requestStatus.x(.fg|.bg|.bd) / düz CSS
    const mapped = colorKeyByLabel?.[s.label];
    if (mapped) return resolveToken(theme, mapped, theme.palette.primary.main);

    // 2) Seri üstünden direkt renk
    if (typeof s.color === 'string' && s.color.trim().length > 0) return s.color;

    // 3) Sıraya göre tema paletinden seç
    const key = paletteOrder[i % paletteOrder.length];
    return theme.palette[key].main;
  });

  const resolvedColors =
    tone === 'soft'
      ? baseColors.map((c) => alpha(c, theme.palette.mode === 'dark' ? 0.95 : 0.75))
      : baseColors;

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
            rx: 1,
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
