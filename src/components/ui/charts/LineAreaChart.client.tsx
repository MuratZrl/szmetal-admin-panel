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

  /** Y ekseni aralığı; sadece min verip 0’dan başlatmak istersen yMin: 0 */
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
  emptyText = 'Görselleştirilecek veri bulunamadı.',
  yValueFormatter = formatNumberTR,
  areaOpacity,
  yMin,
  yMax,
  colorKeyByLabel,
  paddingBottom = 0,
}: Props) {
  const theme = useTheme();

  // Boş ya da eksik veri kontrolü
  if (!Array.isArray(labels) || labels.length === 0 || !Array.isArray(series) || series.length === 0) {
    return (
      <EmptyState height={height} text={emptyText} />
    );
  }

  // Uzunluk ve NaN temizliği
  const { labels: safeLabels, series: safeSeries } = clampSeries(labels, series);
  if (safeLabels.length === 0) {
    return (
      <EmptyState height={height} text={emptyText} />
    );
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

  // Alan opaklığını mod’a göre belirle
  const resolvedAreaOpacity =
    typeof areaOpacity === 'number'
      ? areaOpacity
      : theme.palette.mode === 'dark'
      ? 0.22
      : 0.16;

  // Serileri renklendir, default’ları doldur
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

  // Y ekseni domain’i; kullanıcı sağlarsa kullan
  const yAxisMin = typeof yMin === 'number' ? yMin : undefined;
  const yAxisMax = typeof yMax === 'number' ? yMax : undefined;

  // Tooltip formatlayıcı
  function toValueFormatter(suffix?: string) {
    return (v: number | null) => `${yValueFormatter(v ?? 0)}${suffix ?? ''}`;
  }

  return (
    <Box>
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
          tickLabelStyle: { fontSize: tickLabelFontSize, fill: theme.palette.text.secondary },
        }]}
        yAxis={[{
          min: yAxisMin,
          max: yAxisMax,
          // küçük titreşimleri azaltmak için otomatik nice değerler
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
        slotProps={{
          tooltip: { trigger: 'axis' },
        }}
        sx={{
          // Alan dolgusu
          '.MuiAreaElement-root': {
            fillOpacity: resolvedAreaOpacity,
            transition: 'fill-opacity 160ms ease',
          },
          // Çizgi kalınlığı
          '.MuiLineElement-root': { strokeWidth: 2.25 },
          // Nokta işaretleri
          '.MuiMarkElement-root': {
            r: 3.2,
            strokeWidth: 1.5,
            stroke: theme.palette.background.paper,
            transition: 'r 120ms ease, opacity 120ms ease',
          },
          '.MuiMarkElement-root:hover': { r: 4 },
          // Izgara
          '.MuiChartsGrid-line': {
            strokeDasharray: '3 3',
            stroke: alpha(theme.palette.text.primary, 0.15),
          },
          // Eksen çizgileri
          '.MuiChartsAxis-line': { stroke: theme.palette.divider },
          // Hover davranışı
          '.MuiLineElement-root:hover': { opacity: theme.palette.mode === 'dark' ? 0.9 : 0.95 },
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
        border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
        borderRadius: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}
