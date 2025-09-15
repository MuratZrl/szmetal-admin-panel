// app/(admin)/dashboard/page.tsx
import { Box, Grid } from '@mui/material';

import { fetchDashboardCards } from '@/features/dashboard/services/card.server';
import { fetchAllDashboardData } from '@/features/dashboard/services/dashboardchart.server';
import CardsGrid from '@/features/dashboard/components/CardsGrid.client';
import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';
import PieDonutChart from '@/components/ui/charts/PieChart.client';

import { get3RollingMonthRange, get6RollingMonthRange } from '@/features/dashboard/utils/rollingMonths';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [cards, data] = await Promise.all([fetchDashboardCards(), fetchAllDashboardData()]);
  const { charts, systems3m, countries3m, statusPie } = data;

  const { labelTR: labelTR3 } = get3RollingMonthRange();
  const { labelTR: labelTR6 } = get6RollingMonthRange();

  return (
    <Box px={1} py={2}>
      
      <CardsGrid data={cards} />

      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Yeni Kullanıcılar"
            timeLabel={labelTR6}   // ← otomatik: "Ağu 13 – Eyl 13" gibi
          >
            <LineAreaChart
              labels={charts.users.labels}
              series={[{ label: 'Yeni kullanıcılar', data: charts.users.data, valueSuffix: ' kullanıcı' }]}
              height={320}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Yeni Talepler"
            timeLabel={labelTR6}   // ← otomatik: "Ağu 13 – Eyl 13" gibi
          >
            <LineAreaChart
              labels={charts.requests.pending.labels}
              series={[
                { label: 'Bekleyen',   data: charts.requests.pending.data,   valueSuffix: ' istek' },
                { label: 'Onaylanan',  data: charts.requests.approved.data,  valueSuffix: ' istek' },
                { label: 'Reddedilen', data: charts.requests.rejected.data,  valueSuffix: ' istek' },
              ]}
              height={320}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Sistemlere Göre Talepler (Gruplu)"
            timeLabel={labelTR3}   // ← otomatik: "Ağu 13 – Eyl 13" gibi
          >
            <GroupBarChart
              labels={countries3m.labels}
              series={countries3m.series.map(s => ({ label: s.label, data: s.data }))}
              height={360}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Taleplerin Durum Dağılımı"
            timeLabel={'Tüm Zamanlar'}   // ← otomatik: "Ağu 13 – Eyl 13" gibi
          >
            <PieDonutChart
              items={statusPie.items}
              donut
              height={360}
              showLegend
              arcLabelMode="percent"
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard
            title="Ülkelere Göre Talepler (Gruplu)"
            timeLabel={labelTR3}   // ← otomatik: "Ağu 13 – Eyl 13" gibi
          >
            <GroupBarChart
              labels={systems3m.labels}
              series={systems3m.series.map(s => ({ label: s.label, data: s.data }))}
              height={360}
            />
          </ChartCard>
        </Grid>
      </Grid>
      
    </Box>
  );
}
