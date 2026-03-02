'use client';
// src/components/ui/charts/LineAreaChart.client.tsx

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type ChartCurve = 'linear' | 'monotoneX' | 'natural' | 'step' | 'catmullRom';

/** Tema paletinden semantik renk seçmek için */
export type SemanticColorKey = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export type LineSeries = {
  /** Legend ve tooltip etiketi */
  label: string;
  /** Y ekseni değerleri; labels ile aynı sırada olmalı */
  data: number[];
  /** Alan dolgusu açılsın mı (default: true) */
  area?: boolean;
  /** Doğrudan CSS rengi (#rrggbb, rgb(), hsl()) */
  color?: string;
  /** Tema palet anahtarı */
  colorKey?: SemanticColorKey;
  /** Nokta işaretleri (default: true) */
  showMark?: boolean;
  /** Tooltip ve eksen değeri son eki, ör. ' kullanıcı' */
  valueSuffix?: string;
  /** Eğri tipi (default: monotoneX) */
  curve?: ChartCurve;
};

type LegendPosition =
  | { vertical: 'top' | 'bottom' }
  | { horizontal: 'left' | 'right' };

type Props = {
  /** X etiketleri (ay isimleri vs.) */
  labels: string[];
  /** Seri dizisi */
  series: LineSeries[];
  /** Grafik yüksekliği (px) */
  height?: number;

  /** Üst başlık ve alt başlık */
  title?: string;
  subtitle?: string;

  /** Izgara çizgileri kontrolü */
  grid?: { horizontal?: boolean; vertical?: boolean };

  /** X ekseni yazı boyutu */
  tickLabelFontSize?: number;

  /** Boş veri mesajı */
  emptyText?: string;

  /** Y değeri formatlayıcı (default: TR format) */
  yValueFormatter?: (v: number) => string;

  /** Alan dolgusu opaklığı (tema moduna göre default verilir) */
  areaOpacity?: number;

  /** Legend gösterimi ve konumu */
  showLegend?: boolean;
  legendPosition?: LegendPosition;

  /** Y ekseni aralığı; sadece min verip 0'dan başlatmak istersen yMin: 0 */
  yMin?: number;
  yMax?: number;

  /** Etiket → semantik renk eşlemesi (override) */
  colorKeyByLabel?: Partial<Record<string, SemanticColorKey | string>>;

  /** Uzun etiketler için yatay grid altında dolgu (görsel tutarlılık) */
  paddingBottom?: number;
};

/* -------------------- Yardımcılar -------------------- */

function formatNumberTR(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('tr-TR') : '0';
}

/** TR/EN statü isimlerini yakalayıp sabit renklendirme için normalize eder */
function normalizeStatusLabel(label: string): 'pending' | 'approved' | 'rejected' | null {
  const s = label.toLowerCase().trim();
  if (['pending', 'bekleyen', 'beklemede'].includes(s)) return 'pending';
  if (['approved', 'onaylanan', 'onaylandı', 'onayli', 'onaylı', 'onay'].includes(s)) return 'approved';
  if (['rejected', 'reddedilen', 'reddedildi'].includes(s)) return 'rejected';
  return null;
}

function isSemanticKey(v: string): v is SemanticColorKey {
  return ['primary', 'secondary', 'success', 'info', 'warning', 'error'].includes(v);
}

/** Dizilerdeki aşırı uzunluk farklarını güvenli kısaltma ile hizala */
function clampSeries(labels: string[], series: LineSeries[]): { labels: string[]; series: LineSeries[] } {
  const minLenAcross = Math.min(labels.length, ...series.map(s => s.data.length));
  if (minLenAcross <= 0) return { labels: [], series: [] };
  const safeLabels = labels.slice(0, minLenAcross);
  const safeSeries = series.map(s => ({
    ...s,
    data: s.data.slice(0, minLenAcross).map(v => (Number.isFinite(v) ? v : 0)),
  }));
  return { labels: safeLabels, series: safeSeries };
}

/* -------------------- Bileşen -------------------- */
export default function LineAreaChart({
  labels,
  series,
  height = 320,
  title,
  subtitle,
  grid = { horizontal: true, vertical: false },
  tickLabelFontSize = 12,
  emptyText = 'Veri bulunamadı.',
  yValueFormatter = formatNumberTR,
  areaOpacity,
  yMin,
  yMax,
  colorKeyByLabel,
  paddingBottom = 0,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Boş ya da eksik veri kontrolü
  if (!Array.isArray(labels) || labels.length === 0 || !Array.isArray(series) || series.length === 0) {
    return <EmptyState height={height} text={emptyText} />;
  }

  // Uzunluk ve NaN temizliği
  const { labels: safeLabels, series: safeSeries } = clampSeries(labels, series);
  if (safeLabels.length === 0) {
    return <EmptyState height={height} text={emptyText} />;
  }

  // Varsayılan renk sırası (tema uyumlu)
  const autoColors: string[] = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.secondary?.main ?? theme.palette.text.primary,
  ];

  // Etiket → renk çözümü
  function resolveColor(s: LineSeries, index: number): string {
    // 1) colorKeyByLabel ağırlıklı override
    const mapped = colorKeyByLabel?.[s.label];
    if (typeof mapped === 'string') {
      if (isSemanticKey(mapped)) return theme.palette[mapped].main;
      return mapped; // doğrudan css rengi
    }

    // 2) Seri içindeki explicit color
    if (typeof s.color === 'string' && s.color.trim().length > 0) {
      return s.color;
    }

    // 3) Seri içindeki semantic key
    if (s.colorKey) {
      return theme.palette[s.colorKey].main;
    }

    // 4) Statü bazlı sabitler
    const norm = normalizeStatusLabel(s.label);
    if (norm === 'pending') return theme.palette.warning.main;
    if (norm === 'approved') return theme.palette.success.main;
    if (norm === 'rejected') return theme.palette.error.main;

    // 5) Otomatik
    return autoColors[index % autoColors.length];
  }

  // Serileri renklendir, default'ları doldur
  const resolvedSeries = safeSeries.map((s, i) => {
    const color = resolveColor(s, i);
    return {
      ...s,
      area: s.area ?? true,
      showMark: s.showMark ?? true,
      curve: s.curve ?? 'monotoneX',
      color,
    };
  });

  // Y ekseni domain'i; kullanıcı sağlarsa kullan
  const yAxisMin = typeof yMin === 'number' ? yMin : undefined;
  const yAxisMax = typeof yMax === 'number' ? yMax : undefined;

  // Tooltip formatlayıcı
  function toValueFormatter(suffix?: string) {
    return (v: number | null) => `${yValueFormatter(v ?? 0)}${suffix ?? ''}`;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        // Fade-in animation on mount
        '@keyframes chartFadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'chartFadeIn 0.5s ease-out',
      }}
    >
      {(title || subtitle) && (
        <Box mb={1}>
          {title && (
            <Typography variant="h6" lineHeight={1.25}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <LineChart
        xAxis={[{
          data: safeLabels,
          scaleType: 'point',
          tickLabelStyle: {
            fontSize: tickLabelFontSize,
            fill: theme.palette.text.secondary,
            fontWeight: 500,
          },
        }]}
        yAxis={[{
          min: yAxisMin,
          max: yAxisMax,
          tickLabelStyle: {
            fontSize: 11,
            fill: alpha(theme.palette.text.secondary, 0.7),
            fontWeight: 400,
          },
        }]}
        series={resolvedSeries.map(s => ({
          label: s.label,
          data: s.data,
          area: s.area,
          showMark: s.showMark,
          curve: s.curve,
          color: s.color,
          valueFormatter: toValueFormatter(s.valueSuffix),
        }))}
        grid={{ horizontal: !!grid.horizontal, vertical: !!grid.vertical }}
        height={height + paddingBottom}
        margin={{ top: 16, right: 16, bottom: 28, left: 48 }}
        slotProps={{
          tooltip: { trigger: 'axis' },
        }}
        sx={{
          // ─── Premium area gradient ───
          '.MuiAreaElement-root': {
            fillOpacity: typeof areaOpacity === 'number'
              ? areaOpacity
              : isDark ? 0.15 : 0.12,
            filter: isDark ? 'none' : 'saturate(1.2)',
            transition: 'fill-opacity 300ms cubic-bezier(0.4,0,0.2,1)',
          },

          // ─── Smooth thick lines with round caps ───
          '.MuiLineElement-root': {
            strokeWidth: 2.5,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            filter: isDark
              ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
            transition: 'stroke-width 200ms ease, filter 200ms ease',
          },
          '.MuiLineElement-root:hover': {
            strokeWidth: 3,
            filter: isDark
              ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))'
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          },

          // ─── Refined data point marks ───
          '.MuiMarkElement-root': {
            r: 3.5,
            strokeWidth: 2,
            stroke: theme.palette.background.paper,
            filter: isDark
              ? 'drop-shadow(0 0 3px rgba(0,0,0,0.4))'
              : 'drop-shadow(0 0 2px rgba(0,0,0,0.06))',
            transition: 'r 200ms cubic-bezier(0.4,0,0.2,1), stroke-width 200ms ease',
          },
          '.MuiMarkElement-root:hover': {
            r: 5,
            strokeWidth: 2.5,
          },

          // ─── Subtle grid lines ───
          '.MuiChartsGrid-line': {
            strokeDasharray: '4 6',
            stroke: alpha(
              theme.palette.text.primary,
              isDark ? 0.08 : 0.1,
            ),
            strokeWidth: 0.75,
          },

          // ─── Axis styling ───
          '.MuiChartsAxis-line': {
            stroke: alpha(theme.palette.divider, 0.6),
            strokeWidth: 1,
          },
          '.MuiChartsAxis-tick': {
            stroke: alpha(theme.palette.divider, 0.4),
          },

          // ─── Tooltip overlay line ───
          '.MuiChartsAxisHighlight-root': {
            stroke: alpha(theme.palette.text.primary, isDark ? 0.15 : 0.12),
            strokeDasharray: '3 3',
            strokeWidth: 1,
          },

          // ─── Smooth hover highlight ───
          '.MuiChartsVirtualElement-root': {
            transition: 'opacity 200ms ease',
          },
        }}
      />
    </Box>
  );
}

/* -------------------- Alt bileşenler -------------------- */

function EmptyState({ height, text }: { height: number; text: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height,
        display: 'grid',
        placeItems: 'center',
        border: `1px dashed ${alpha(theme.palette.text.primary, 0.12)}`,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.text.primary, 0.02),
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
        {text}
      </Typography>
    </Box>
  );
}
