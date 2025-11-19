// src/features/products_analytics/components/CardsGrid.tsx
import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import { getProductStats, computeChangePercentage } from '@/features/products_analytics/services/cards.server';

export default async function CardsGrid() {
  const { totalCount, thisMonthCount, prevMonthCount, prevPrevMonthCount } = await getProductStats();

  const prevTotal = Math.max(0, totalCount - thisMonthCount);

  const totalPct = computeChangePercentage(totalCount, prevTotal);
  const thisMonthPct = computeChangePercentage(thisMonthCount, prevMonthCount);
  const prevMonthPct = computeChangePercentage(prevMonthCount, prevPrevMonthCount);

  const monthDelta = thisMonthCount - prevMonthCount;
  const prevMonthDelta = prevMonthCount - prevPrevMonthCount;

  return (
    <Grid
      container
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam ürün"
          value={totalCount}
          percentage={totalPct}
          delta={thisMonthCount}
          percentDecimals={1}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Bu ay eklenen ürünler"
          value={thisMonthCount}
          percentage={thisMonthPct}
          delta={monthDelta}
          percentDecimals={1}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Geçen ay eklenen ürünler"
          value={prevMonthCount}
          percentage={prevMonthPct}
          delta={prevMonthDelta}
          percentDecimals={1}
        />
      </Grid>
    </Grid>
  );
}
