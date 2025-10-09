// app/(admin)/requests/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { Box, Grid } from '@mui/material';

import { requirePageAccess } from '@/lib/supabase/auth/server';      // ← EKLE

import CardsGrid from '@/features/requests/components/CardsGrid.client';
import { getRequestsCardsData } from '@/features/requests/services/card.server';

import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart, { type LineSeries } from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';

import { getRequestsLineCharts } from '@/features/requests/services/chart.server';

import TableGrid from '@/features/requests/components/TableGrid.client';
import { getRequestsTablePage } from '@/features/requests/services/table.server';

const STATUS_TR: Record<string, string> = {
  pending: 'Bekleyen',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#ed6c02',
  approved: '#2e7d32',
  rejected: '#d32f2f',
};

export default async function RequestsPage() {
  // ←← KİLİT: Sadece Admin/Manager içeri girsin
  await requirePageAccess('requests');

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

  const firstLabel = charts.totals.labels[0] ?? '';
  const lastLabel = charts.totals.labels[charts.totals.labels.length - 1] ?? '';
  const rangeLabel = firstLabel && lastLabel ? `${firstLabel} - ${lastLabel}` : undefined;

  const totalsSeries: LineSeries[] = charts.totals.series.map(s => ({
    label: s.label,
    data: s.data,
    area: true,
    showMark: true,
    valueSuffix: ' adet',
    curve: 'monotoneX',
  }));

  const barSeries: Parameters<typeof GroupBarChart>[0]['series'] =
    charts.byStatus.series.map(s => ({
      label: STATUS_TR[s.label] ?? s.label,
      data: (s.data ?? []).slice(0, charts.byStatus.labels.length),
      color: STATUS_COLOR[s.label],
    }));

  return (
    <Box px={1} py={2}>
      <CardsGrid data={cardsData} />

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
            <GroupBarChart
              labels={charts.byStatus.labels}
              series={barSeries}
              height={320}
            />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid sx={{ mt: 2 }}>
        <TableGrid rows={tablePage.rows} />
      </Grid>
    </Box>
  );
}
