'use client';
// src/components/ui/charts/CategoryDonutChart.client.tsx

import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

export type CategoryItem = {
  label: string;
  value: number;
};

type Props = {
  items: CategoryItem[];
  height?: number;
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

// ─── Theme-aware red gradient palettes ───
// Light: deeper red tones that pop on white backgrounds
const LIGHT_COLORS = [
  '#4A0D13', // deepest burgundy
  '#6B1520', // dark crimson
  '#8B1A2B', // wine
  '#B3122F', // brand red
  '#D42B47', // crimson
  '#E8506A', // medium rose
  '#F0758B', // salmon pink
  '#F5A3B3', // light rose
  '#F9C4CF', // blush
  '#FDE8EC', // palest pink
] as const;

// Dark: brighter, more vibrant red tones visible on dark backgrounds
const DARK_COLORS = [
  '#FF1744', // vivid red
  '#E8506A', // medium rose
  '#F0758B', // salmon pink
  '#D42B47', // crimson
  '#F5A3B3', // light rose
  '#FF5252', // bright red
  '#EF5350', // warm red
  '#F48FB1', // soft pink
  '#E57373', // muted coral red
  '#FFCDD2', // lightest rose
] as const;

export default function CategoryDonutChart({ items, height = 280 }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const safe = React.useMemo(() => {
    return (items ?? [])
      .map((it) => ({
        label: (it?.label ?? 'Bilinmiyor').toString(),
        value: Number.isFinite(it?.value) ? Number(it.value) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const total = safe.reduce((acc, s) => acc + s.value, 0);

  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  const data = safe.map((s, i) => ({
    id: i,
    label: s.label,
    value: s.value,
    color: palette[i % palette.length],
  }));

  // Client-only flag to avoid SSR hydration mismatch on SVG coordinates
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const donutSize = 320;
  const innerRadius = 100;
  const outerRadius = 145;

  const isEmpty = !safe.length || total === 0;

  const displayData = isEmpty
    ? [{ id: 0, label: '', value: 1, color: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06) }]
    : data;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: height,
        '@keyframes catReveal': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'catReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* ─── Donut chart ─── */}
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: donutSize,
          height: donutSize,
        }}
      >
        {mounted && (
          <PieChart
            width={donutSize}
            height={donutSize}
            hideLegend
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            series={[
              {
                data: displayData,
                innerRadius,
                outerRadius,
                paddingAngle: 3,
                cornerRadius: 5,
                arcLabel: () => '',
                faded: {
                  innerRadius,
                  additionalRadius: -4,
                  color: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                },
                valueFormatter: (p) => `${formatTR(p.value ?? 0)} \u00FCr\u00FCn`,
              },
            ]}
            sx={{
              '.MuiPieArc-root': {
                stroke: 'none !important',
                strokeWidth: '0 !important',
                filter: isDark
                  ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.55))'
                  : 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
                transition: 'all 350ms cubic-bezier(0.22,1,0.36,1)',
                cursor: 'pointer',
                '&:hover': {
                  filter: isDark
                    ? 'drop-shadow(0 4px 16px rgba(244,80,107,0.4))'
                    : 'drop-shadow(0 4px 14px rgba(179,18,47,0.3))',
                },
              },
              '.MuiPieArc-root path, .MuiPieArc-faded, .MuiPieArc-highlighted': {
                stroke: 'none !important',
                strokeWidth: '0 !important',
              },
            }}
          />
        )}

        {/* ─── Center overlay ─── */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ textAlign: 'center', lineHeight: 1 }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
                color: 'text.primary',
                lineHeight: 1.1,
              }}
            >
              {formatTR(total)}
            </Typography>
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 500,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mt: 0.3,
              }}
            >
              toplam
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Legend with progress bars (right side) ─── */}
      {!isEmpty && (
        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0, py: 1 }}>
          {data.map((item) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <Box key={item.id}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.3 }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${alpha(item.color, 0.4)}`,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="baseline" spacing={0.5} flexShrink={0}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'text.primary',
                      }}
                    >
                      {formatTR(item.value)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 500,
                        color: 'text.secondary',
                      }}
                    >
                      ({pct.toFixed(1)}%)
                    </Typography>
                  </Stack>
                </Stack>
                {/* Progress bar */}
                <Box
                  sx={{
                    width: '100%',
                    height: 7,
                    borderRadius: 3,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: item.color,
                      transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
