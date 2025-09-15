// src/components/ui/cards/StatCard.client.tsx
'use client';

import * as React from 'react';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import CountUp from 'react-countup';

type TrendDir = 'up' | 'down';

type StatCardProps = {
  title: string;
  /** Kartın ana değeri (toplam vs.) */
  value: number;
  /** Yüzdelik değişimin yönü (ok ve renk için) */
  trend?: TrendDir;
  /** Yüzdelik değişim (0..100). UI'da mutlak gösterilir, renk/ok yön belirler. */
  percentage?: number;
  /** Geçen aya göre mutlak fark (bu ay eklenen − geçen ay eklenen). Metin olarak gösterilir. */
  delta?: number;

  /** Başlığın altında küçük açıklama */
  subtitle?: string;
  /** Sağ üstte info ikonu ile gösterilecek kısa yardım metni */
  helpText?: string;
  /** Başlığın solunda gösterilecek küçük bir ikon (opsiyonel) */
  icon?: React.ReactNode;

  /** Kart yükleniyor ise iskelet gösterimi */
  loading?: boolean;

  /** Başlık rengi/aksan için öncelik. Default otomatik tema. */
  color?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';

  /** Değeri özel formatlamak istersen */
  valueFormatter?: (n: number) => string;
  /** Kartın yüksekliği; otomatik bırakılabilir */
  minHeight?: number;

  /** percentage yokken (prev=0 vb.) sağ üstte gösterilecek metin. Varsayılan: 'Yeni' */
  emptyPctLabel?: string;
};

export default function StatCard({
  title,
  value,
  trend,
  percentage,
  delta,
  subtitle,
  icon,
  loading = false,
  minHeight = 110,
  emptyPctLabel = 'Yeni',   // ← yeni prop default
}: StatCardProps) {

  const pct = Number.isFinite(percentage as number)
    ? Math.abs(percentage as number)
    : undefined;

  const isDown = trend === 'down';

  // Delta metni
  let deltaText = 'Bu ay yeni kayıt yok.';
  if (typeof delta === 'number' && delta > 0) {
    deltaText = `Bu ay ${delta} yeni kayıt.`;
  }

  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          minHeight,
        }}
        data-testid="stat-card-skeleton"
      >
        <CardContent sx={{ px: { xs: 1.5, sm: 2.5 }, py: { xs: 1.5, sm: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Skeleton variant="text" width={160} height={18} />
            <Skeleton variant="text" width={64} height={18} />
          </Box>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="text" width={200} height={16} sx={{ mt: 0.5 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        minHeight,
      }}
      data-testid="stat-card"
    >

      <CardContent sx={{ px: { xs: 1.5, sm: 2.5 }, py: { xs: 1.5, sm: 2 } }}>

        {/* Üst satır: başlık + yardım + yüzde/ok */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.75}
          gap={1}
          flexWrap="wrap"
        >
          
          {/* Sol blok: ikon + başlık + alt başlık */}
          <Box display="flex" alignItems="center" gap={1} minWidth={0}>
            {icon && <Box aria-hidden>{icon}</Box>}
            <Box minWidth={0}>
              <Box display="flex" alignItems="center" gap={0.75}>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  {title}
                </Typography>
              </Box>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {typeof pct === 'number' ? (
            <Box display="flex" alignItems="center" gap={{ xs: 0.25, sm: 0.5 }}>
              {isDown ? <ArrowDropDownIcon fontSize="small" color="error" /> : <ArrowDropUpIcon fontSize="small" color="success" />}
              <Typography variant="body2" color={isDown ? 'error.main' : 'success.main'} sx={{ fontWeight: 500 }}>
                <CountUp end={pct} duration={0.9} suffix="%" decimals={0} />
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {emptyPctLabel}   {/* ← sabit 'Yeni' yerine override edilebilir */}
            </Typography>
          )}
        </Box>

        {/* Ana değer */}
        <Typography
          variant="h5"
          fontWeight={700}
          fontSize={{ xs: '1.5rem', sm: '1.75rem' }}
          lineHeight={1.1}
          aria-live="polite"
          data-testid="stat-card-value"
        >

          {/* CountUp ile TR formatı: separator '.' decimal ',' */}
          <CountUp
            end={Number.isFinite(value) ? value : 0}
            duration={1.1}
            separator="."
            decimal=","
            preserveValue={false}
          />
        </Typography>

        {/* Delta cümlesi */}
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.6 }}
          color={typeof delta === 'number' && delta > 0 ? 'success.main' : 'text.secondary'}
          data-testid="stat-card-delta"
        >
          {deltaText}
        </Typography>

      </CardContent>
    </Card>
  );
}
