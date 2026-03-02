'use client';
// src/components/ui/charts/PieDonutChart.client.tsx

import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type ColorKey = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export type PieItem = {
  label: string;
  value: number;
  color?: string;      // doğrudan hex/rgb (opsiyonel)
  colorKey?: ColorKey; // tema paletinden anahtar (opsiyonel)
};

type Props = {
  items: PieItem[];
  title?: string;
  height?: number;                 // varsayılan 320
  donut?: boolean;                 // true: donut, false: klasik pie
  showLegend?: boolean;            // şimdilik kullanılmıyor
  topK?: number;                   // çok kategori varsa ilk K
  othersLabel?: string;            // ileride "diğer" eklemek için
  arcLabelMode?: 'percent' | 'value' | 'none';
  /** Değerlerin sonuna eklenecek suffix, ör: ' ürün' */
  valueSuffix?: string;

  // Label -> palette key eşlemesi; ör: { Bekleyen:'warning', Onaylanan:'success', Reddedilen:'error' }
  colorKeyByLabel?: Partial<Record<string, ColorKey>>;
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

function normalizeLabel(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

const DEFAULT_STATUS_COLORS: Record<string, ColorKey> = (() => {
  const map = new Map<string, ColorKey>([
    ['bekleyen', 'warning'],
    ['onaylanan', 'success'],
    ['reddedilen', 'error'],
    ['pending', 'warning'],
    ['approved', 'success'],
    ['rejected', 'error'],
    ['iptal', 'error'],
    ['canceled', 'error'],
  ]);
  const obj: Record<string, ColorKey> = {};
  for (const [k, v] of map) obj[k] = v;
  return obj;
})();

export default function PieDonutChart({
  items,
  title,
  height = 320,
  donut = true,
  topK = 10,
  arcLabelMode = 'percent',
  valueSuffix = '',
  colorKeyByLabel,
}: Props) {

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const safe = React.useMemo(() => {
    const cleaned = (items ?? [])
      .map((it) => ({
        label: (it?.label ?? 'bilinmiyor').toString(),
        value: Number.isFinite(it?.value) ? Number(it.value) : 0,
        color: it.color,
        colorKey: it.colorKey,
      }))
      .sort((a, b) => b.value - a.value);

    if (!cleaned.length) return cleaned;
    if (cleaned.length > topK) {
      return cleaned.slice(0, topK);   // ← burada en fazla topK kadar kesiyor
    }
    return cleaned;
  }, [items, topK]);

  const total = safe.reduce((acc, s) => acc + s.value, 0);

  const formatValue = React.useCallback(
    (v: number) => `${formatTR(v)}${valueSuffix}`,
    [valueSuffix],
  );

  if (!safe.length) {
    return (
      <Box
        sx={{
          height,
          display: 'grid',
          placeItems: 'center',
          border: `1px dashed ${alpha(theme.palette.text.primary, 0.15)}`,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.text.primary, 0.02),
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
          Görselleştirilecek veri bulunamadı.
        </Typography>
      </Box>
    );
  }

  const fallbackPalette = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.secondary?.main ?? theme.palette.text.primary,
  ];

  const getColorFromKey = (key: ColorKey): string => theme.palette[key].main;

  const resolveColor = (label: string, idx: number, color?: string, colorKey?: ColorKey): string => {
    if (color) return color;
    if (colorKey) return getColorFromKey(colorKey);

    const norm = normalizeLabel(label);
    const fromProp = colorKeyByLabel && colorKeyByLabel[norm as keyof typeof colorKeyByLabel];
    if (fromProp) return getColorFromKey(fromProp);

    const fromDefault = DEFAULT_STATUS_COLORS[norm];
    if (fromDefault) return getColorFromKey(fromDefault);

    return fallbackPalette[idx % fallbackPalette.length];
  };

  const data = safe.map((s, i) => ({
    id: i,
    label: s.label,
    value: s.value,
    color: resolveColor(s.label, i, s.color, s.colorKey),
  }));

  const innerRadius = donut ? Math.max(40, Math.floor(height * 0.22)) : 0;
  const outerRadius = Math.max(innerRadius + 40, Math.floor(height * 0.42));

  const arcLabel =
    arcLabelMode === 'none'
      ? undefined
      : (item: { value: number }) => {
          if (arcLabelMode === 'value') return formatValue(item.value);
          if (total <= 0) return '';
          const pct = Math.round((item.value / total) * 100);
          return pct >= 2 ? `${pct}%` : '';
        };

  return (
    <Box
      sx={{
        position: 'relative',
        '@keyframes pieFadeIn': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        animation: 'pieFadeIn 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}

      <PieChart
        height={height}
        hideLegend
        series={[
          {
            data,
            innerRadius,
            outerRadius,
            paddingAngle: 2.5,
            cornerRadius: 4,
            arcLabel,
            arcLabelMinAngle: 12,
            faded: {
              innerRadius,
              additionalRadius: -8,
              color: alpha(theme.palette.text.primary, 0.15),
            },
            valueFormatter: (p) => formatValue(p.value ?? 0),
          },
        ]}
        sx={{
          '.MuiChartsLegend-mark': { borderRadius: '50%' },
          '.MuiChartsTooltip-root': { textTransform: 'none' },
          // ─── Premium pie slice styling ───
          '.MuiPieArc-root': {
            stroke: 'none !important',
            strokeWidth: '0 !important',
            filter: isDark
              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))',
            transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1), filter 300ms ease',
          },
          // Remove stroke on highlighted/faded states too
          '.MuiPieArc-root path, .MuiPieArc-faded, .MuiPieArc-highlighted': {
            stroke: 'none !important',
            strokeWidth: '0 !important',
          },
          // ─── Arc label styling ───
          '.MuiPieArcLabel-root': {
            fill: '#fff',
            fontWeight: 600,
            fontSize: 12,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          },
        }}
      />

      {donut && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              lineHeight: 1.1,
              // Subtle frosted circle behind the center text
              bgcolor: alpha(
                theme.palette.background.paper,
                isDark ? 0.6 : 0.8,
              ),
              borderRadius: '50%',
              width: innerRadius * 1.5,
              height: innerRadius * 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Toplam
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: '1.1rem',
              }}
            >
              {formatValue(total)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
