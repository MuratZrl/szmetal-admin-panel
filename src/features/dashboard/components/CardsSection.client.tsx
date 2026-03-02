'use client';
// src/features/dashboard/components/CardsGrid.client.tsx

import { Grid, Box, CircularProgress } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import MiniSparkline from '@/components/ui/charts/MiniSparkline.client';
import { MotionContainer, MotionItem } from '@/components/ui/motion';
import type { CardsData } from '@/features/dashboard/services/card.server';

type Props = {
  data: CardsData;
  userSparkData?: number[];
  productSparkData?: number[];
  loading?: boolean;
};

// Yüzde 0 geldiğinde "yüzde gösterme" ki boş etiket devreye girsin.
function pctOrUndefined(t?: { change: number | null } | null): number | undefined {
  if (!t || t.change == null) return undefined;
  return t.change > 0 ? t.change : undefined; // 0 ise undefined döner
}

export default function CardsGrid({ data, userSparkData, productSparkData, loading }: Props) {
  const { totals, trends, deltas } = data;

  const userPct = pctOrUndefined(trends.user);
  const prodPct = pctOrUndefined(trends.product);

  const emptyUserLabel = userPct === undefined ? (deltas.user > 0 ? 'Yeni' : 'Değişim yok') : undefined;
  const emptyProdLabel = prodPct === undefined ? (deltas.product > 0 ? 'Yeni' : 'Değişim yok') : undefined;

  return (
    <MotionContainer>
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.4)',
              borderRadius: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      <Grid container spacing={2} sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <MotionItem>
            <StatCard
              title="Toplam Kullanıcı"
              value={totals.totalUsers}
              percentage={userPct}
              trend={trends.user?.trend}
              delta={deltas.user}
              emptyPctLabel={emptyUserLabel}
              color="error"
              detailsHref="/clients"
              details={
                userSparkData?.length ? (
                  <MiniSparkline data={userSparkData} color="error" height={48} />
                ) : undefined
              }
            />
          </MotionItem>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <MotionItem>
            <StatCard
              title="Toplam Ürünler"
              value={totals.totalProducts}
              percentage={prodPct}
              trend={trends.product?.trend}
              delta={deltas.product}
              emptyPctLabel={emptyProdLabel}
              color="info"
              detailsHref="/products_analytics"
              details={
                productSparkData?.length ? (
                  <MiniSparkline data={productSparkData} color="info" height={48} />
                ) : undefined
              }
            />
          </MotionItem>
        </Grid>
      </Grid>
      </Box>
    </MotionContainer>
  );
}
