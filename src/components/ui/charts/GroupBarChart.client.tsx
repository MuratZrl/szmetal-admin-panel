'use client';
// src/components/ui/charts/GroupBarChart.client.tsx

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme, alpha, type Theme } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

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
  const isDark = theme.palette.mode === 'dark';

  if (!labels.length || !series.length) {
    const emptyBarColor = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04);
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Mini bar chart illustration */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 64 }}>
          {[28, 48, 20, 40, 64, 34].map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 14,
                height: h,
                borderRadius: '4px 4px 2px 2px',
                bgcolor: emptyBarColor,
              }}
            />
          ))}
        </Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: 'text.secondary',
            opacity: 0.55,
            letterSpacing: 0.15,
          }}
        >
          Görselleştirecek veri bulunamadı.
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
      ? baseColors.map((c) => alpha(c, isDark ? 0.95 : 0.75))
      : baseColors;

  // Calculate totals per series for the legend badges
  const seriesTotals = series.map((s) =>
    s.data.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0),
  );

  return (
    <Box
      sx={{
        '@keyframes barChartFadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'barChartFadeIn 0.5s ease-out',
      }}
    >
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}

      {/* ─── Compact custom legend with totals ─── */}
      <Stack
        direction="row"
        sx={{ mb: 0.75, px: 0.5, flexWrap: 'wrap', gap: 1.25 }}
      >
        {series.map((s, i) => (
          <Stack
            key={s.label}
            direction="row"
            spacing={0.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '2px',
                flexShrink: 0,
                bgcolor: resolvedColors[i],
                boxShadow: `0 0 4px ${alpha(resolvedColors[i], isDark ? 0.4 : 0.25)}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: 11,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </Typography>
            <Box
              sx={{
                px: 0.5,
                py: 0.125,
                borderRadius: 0.75,
                bgcolor: alpha(resolvedColors[i], isDark ? 0.15 : 0.1),
                lineHeight: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: resolvedColors[i],
                  fontWeight: 700,
                  fontSize: 10,
                  lineHeight: 1,
                }}
              >
                {formatTR(seriesTotals[i])}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <BarChart
        xAxis={[
          {
            data: labels,
            scaleType: 'band',
            tickLabelStyle: {
              fontSize: 11.5,
              fill: theme.palette.text.secondary,
              fontWeight: 500,
            },
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fontSize: 11,
              fill: alpha(theme.palette.text.secondary, 0.6),
              fontWeight: 400,
            },
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
        margin={{ top: 8, right: 12, bottom: 36, left: 44 }}
        borderRadius={8}
        hideLegend
        sx={{
          // ─── Subtle grid — barely visible lines ───
          '.MuiChartsGrid-line': {
            strokeDasharray: '4 6',
            stroke: alpha(
              theme.palette.text.primary,
              isDark ? 0.06 : 0.08,
            ),
            strokeWidth: 0.75,
          },

          // ─── Clean axis lines ───
          '.MuiChartsAxis-line': {
            stroke: alpha(theme.palette.divider, 0.5),
            strokeWidth: 1,
          },
          '.MuiChartsAxis-tick': {
            stroke: alpha(theme.palette.divider, 0.3),
          },

          // ─── Premium bars with glow ───
          '.MuiBarElement-root': {
            filter: isDark
              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))',
            transition: 'filter 250ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease',
          },
          '.MuiBarElement-root:hover': {
            filter: isDark
              ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.7)) brightness(1.15)'
              : 'drop-shadow(0 3px 10px rgba(0,0,0,0.15)) brightness(1.05)',
          },

          // ─── Highlight band on hover ───
          '.MuiChartsAxisHighlight-root': {
            fill: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
            stroke: 'none',
          },
        }}
      />
    </Box>
  );
}
