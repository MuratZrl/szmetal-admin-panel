// src/components/ui/charts/PieDonutChart.client.tsx
'use client';

import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type PieItem = { label: string; value: number; color?: string };

type Props = {
  items: PieItem[];
  title?: string;
  height?: number;               // varsayılan 320
  donut?: boolean;               // true: donut, false: klasik pie
  showLegend?: boolean;          // varsayılan true
  topK?: number;                 // çok kategori varsa ilk K + "diğer"
  othersLabel?: string;          // varsayılan 'diğer'
  arcLabelMode?: 'percent' | 'value' | 'none'; // dilim üstü etiket modu
  valueFormatter?: (v: number) => string;      // tooltip/etiket formatlayıcı
};

function formatTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

export default function PieDonutChart({
  items,
  title,
  height = 320,
  donut = true,
  topK = 6,
  arcLabelMode = 'percent',
  valueFormatter = formatTR,
}: Props) {
  const theme = useTheme();

  const safe = React.useMemo(() => {
    const cleaned = (items ?? [])
      .map(it => ({
        label: (it?.label ?? 'bilinmiyor').toString(),
        value: Number.isFinite(it?.value) ? Number(it.value) : 0,
        color: it.color,
      }))
      // En azından 0 olmayanları öne alalım; 0’lar gösterilebilir, ama sıralama için faydalı
      .sort((a, b) => b.value - a.value);

    if (!cleaned.length) return cleaned;

    if (cleaned.length > topK) {
      const head = cleaned.slice(0, topK);
      return head;
    }

    return cleaned;
  }, [items, topK]);

  const total = safe.reduce((acc, s) => acc + s.value, 0);

  if (!safe.length) {
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

  const palette = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.secondary?.main ?? theme.palette.text.primary,
  ];

  const data = safe.map((s, i) => ({
    id: i,
    label: s.label,
    value: s.value,
    color: s.color ?? palette[i % palette.length],
  }));

  const innerRadius = donut ? Math.max(40, Math.floor(height * 0.22)) : 0;
  const outerRadius = Math.max(innerRadius + 40, Math.floor(height * 0.42));

  const arcLabel =
    arcLabelMode === 'none'
      ? undefined
      : (item: { value: number }) => {
          if (arcLabelMode === 'value') return valueFormatter(item.value);
          // percent
          if (total <= 0) return '';
          const pct = Math.round((item.value / total) * 100);
          return pct >= 2 ? `${pct}%` : ''; // ufak dilimleri etiketlemeden geç
        };

  return (
    <Box sx={{ position: 'relative' }}>
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
            paddingAngle: 2,
            cornerRadius: 3,
            arcLabel,
            arcLabelMinAngle: 12,
            faded: {
              innerRadius,
              additionalRadius: -6,
              color: alpha(theme.palette.text.primary, 0.2),
            },
            valueFormatter: (p) => `${valueFormatter(p.value ?? 0)}`,
          },
        ]}
        sx={{
          '.MuiChartsLegend-mark': { borderRadius: '50%' },
          '.MuiChartsTooltip-root': { textTransform: 'none' },
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
          <Box sx={{ textAlign: 'center', lineHeight: 1.1 }}>
            <Typography variant="caption" color="text.secondary">
              Toplam
            </Typography>
            <Typography variant="h6">{valueFormatter(total)}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
