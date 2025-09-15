// app/(admin)/requests/page.tsx
import { Box, Grid } from '@mui/material';

import CardsGrid from '@/features/requests/components/CardsGrid.client';
import { getRequestsCardsData } from '@/features/requests/services/card.server';

import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart, { type LineSeries } from '@/components/ui/charts/LineAreaChart.client';
import { getRequestsLineCharts } from '@/features/requests/services/chart.server';

import TableGrid from '@/features/requests/components/TableGrid.client';
import { getRequestsTablePage } from '@/features/requests/services/table.server';

const STATUS_TR: Record<string, string> = {
  pending: 'Bekleyen',
  approved: 'Kabul',
  rejected: 'Reddedilen',
  canceled: 'İptal',
  cancelled: 'İptal',
  unknown: 'Bilinmeyen',
};

// En azından günde bir yenilensin; etiketteki gün değişiyor
export const revalidate = 86400;

export default async function RequestsPage() {
  const [cardsData, charts, tablePage] = await Promise.all([
    getRequestsCardsData(),
    getRequestsLineCharts({ cumulative: true }),
    getRequestsTablePage({
      page: 1,
      pageSize: 25,
      sortField: 'created_at',
      sortDir: 'desc',
      status: 'all',
    }),
  ]);

  // Etiket: "Nis 14 - Eyl 14"
  const firstLabel = charts.totals.labels[0] ?? '';
  const lastLabel  = charts.totals.labels[charts.totals.labels.length - 1] ?? '';
  const rangeLabel = firstLabel && lastLabel ? `${firstLabel} - ${lastLabel}` : undefined;

  const totalsSeries: LineSeries[] = charts.totals.series.map(s => ({
    label: s.label,
    data: s.data,
    area: true,
    showMark: true,
    valueSuffix: ' adet',
    curve: 'monotoneX',
  }));

  const byStatusSeries: LineSeries[] = charts.byStatus.series.map(s => ({
    label: STATUS_TR[s.label] ?? s.label,
    data: s.data,
    area: true,
    showMark: true,
    valueSuffix: ' adet',
    curve: 'monotoneX',
  }));

  return (
    <Box px={1} py={2}>

      {/* 1) kart */}
      <CardsGrid data={cardsData} />

      {/* 2) grafik */}
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Toplam Talepler" timeLabel={rangeLabel}>
            <LineAreaChart
              labels={charts.totals.labels}
              series={totalsSeries}
              height={320}
              grid={{ horizontal: true, vertical: false }}
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Duruma Göre Toplam Talepler" timeLabel={rangeLabel}>
            <LineAreaChart
              labels={charts.byStatus.labels}
              series={byStatusSeries}
              height={320}
              grid={{ horizontal: true, vertical: false }}
            />
          </ChartCard>
        </Grid>
      </Grid>

      {/* 3) Tablo */}
      <Grid sx={{ mt: 2 }}>
        <TableGrid rows={tablePage.rows} />
      </Grid>

    </Box>
  );
}
