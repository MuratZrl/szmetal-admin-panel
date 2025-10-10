// src/components/ui/cards/StatCard.client.tsx
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Button,
} from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { usePathname, useRouter } from 'next/navigation';
import CountUp from 'react-countup';

type TrendDir = 'up' | 'down';

type StatCardProps = {
  title: string;
  /** Kartın ana değeri (toplam vs.) */
  value: number;

  /** Yüzdelik değişim yönü. Gelmezse yüzdeye göre türetilir. */
  trend?: TrendDir;
  /** Yüzdelik değişim. 0..100 aralığında beklenir; işaret önemlidir. */
  percentage?: number | null;

  /** Bu ay eklenen adet (istenirse negatif de olabilir) */
  delta?: number | null;

  /** Başlığın altında küçük açıklama */
  subtitle?: string;
  /** Başlığın solunda opsiyonel küçük ikon */
  icon?: React.ReactNode;

  /** Yükleme iskeleti */
  loading?: boolean;

  /** Renk aksanı */
  color?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';

  /** Değeri özel formatlamak istersen */
  valueFormatter?: (n: number) => string;

  /** Kart yüksekliği */
  minHeight?: number;

  /** percentage yokken gösterilecek etiket (prev=0 gibi) */
  emptyPctLabel?: string;
  /** percentage yaklaşık 0 iken gösterilecek etiket (eşit/çok küçük fark) */
  noChangeLabel?: string;

  /** Yüzdede kaç ondalık gösterilsin */
  percentDecimals?: number;

  /** |percentage| ≤ epsilon ise “Değişim yok” say. Varsayılan: 0.5 yüzde puan */
  noChangeEpsilon?: number;

  details?: React.ReactElement;

  /** Dashboard’ta tıklanınca gidilecek sayfa */
  detailsHref?: `/${string}`;
  /** Buton metni override etmek istersen */
  detailsLabel?: string;
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
  color = 'default',
  valueFormatter,
  minHeight = 110,
  emptyPctLabel = 'Yeni',
  noChangeLabel = 'Değişim yok',
  percentDecimals = 0,
  noChangeEpsilon = 0.5,
  details,
  detailsHref,
  detailsLabel = 'Detaylar',
}: StatCardProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Sadece dashboard'ta ve detailsHref varsa buton göster
  const isDashboard = pathname === '/dashboard';
  const showDetailsButton = isDashboard && Boolean(detailsHref);

  // Yüzdeyi normalize et
  const rawPct = typeof percentage === 'number' ? percentage : undefined;
  const isPctProvided = typeof rawPct === 'number' && Number.isFinite(rawPct);

  // “değişim yok” penceresi
  const isNoChange = isPctProvided ? Math.abs(rawPct as number) <= Math.max(0, noChangeEpsilon) : false;

  // Gösterilecek mod
  const showPct = isPctProvided && !isNoChange;
  const pctAbs = showPct ? Math.abs(rawPct as number) : undefined;

  // Yönü belirle
  const effectiveTrend: TrendDir | undefined = showPct
    ? trend ?? ((rawPct as number) >= 0 ? 'up' : 'down')
    : undefined;

  // Delta metni
  let deltaText = 'Bu ay yeni kayıt yok.';
  if (typeof delta === 'number') {
    if (delta > 0) deltaText = `Bu ay ${delta} yeni kayıt.`;
    else if (delta < 0) deltaText = `Geçen aya göre ${Math.abs(delta)} daha az.`;
  }

  const handleDetails = React.useCallback(() => {
    if (showDetailsButton && detailsHref) {
      router.push(detailsHref);
    }
  }, [showDetailsButton, detailsHref, router]);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, minHeight }} data-testid="stat-card-skeleton">
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
        display: 'flex',
        flexDirection: 'column',
        ...(color !== 'default' && {
          '--_color':
            color === 'primary' ? 'primary.main' :
            color === 'success' ? 'success.main' :
            color === 'info'    ? 'info.main' :
            color === 'warning' ? 'warning.main' :
            color === 'error'   ? 'error.main' :
            'text.primary',
        } as React.CSSProperties),
      }}
      data-testid="stat-card"
    >
      <CardContent
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          flexGrow: 1,
        }}
      >
        {/* Üst satır: başlık + yüzde/ok veya etiket */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75} gap={1} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1} minWidth={0}>
            {icon && <Box aria-hidden>{icon}</Box>}
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="text.secondary" noWrap>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {showPct && typeof pctAbs === 'number' ? (
            <Box display="flex" alignItems="center" gap={{ xs: 0.25, sm: 0.5 }}>
              {effectiveTrend === 'down'
                ? <ArrowDropDownIcon fontSize="small" color="error" />
                : <ArrowDropUpIcon fontSize="small" color="success" />}
              <Typography
                variant="body2"
                color={effectiveTrend === 'down' ? 'error.main' : 'success.main'}
                sx={{ fontWeight: 500 }}
              >
                <CountUp
                  end={pctAbs}
                  duration={0.9}
                  suffix="%"
                  decimals={Math.max(0, percentDecimals)}
                />
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {isPctProvided ? noChangeLabel : emptyPctLabel}
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
          {typeof valueFormatter === 'function' ? (
            valueFormatter(value)
          ) : (
            <CountUp end={Number.isFinite(value) ? value : 0} duration={1.1} separator="." decimal="," />
          )}
        </Typography>

        {/* Varsa ek detay içeriği */}
        {details ?? null}

        {/* Alt satır: delta metni + (varsa) Detaylar butonu */}
        <Box
          sx={{
            mt: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            color={typeof delta === 'number' && delta > 0 ? 'success.main' : 'text.secondary'}
            data-testid="stat-card-delta"
            title={deltaText}
            noWrap
          >
            {deltaText}
          </Typography>

          {showDetailsButton && (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={handleDetails}
              data-testid="stat-card-details-btn"
              aria-label={detailsLabel}
              sx={{ flexShrink: 0 }}
            >
              {detailsLabel}
            </Button>
          )}
        </Box>

      </CardContent>
    </Card>
  );
}
