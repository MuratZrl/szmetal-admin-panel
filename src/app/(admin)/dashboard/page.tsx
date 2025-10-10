// app/(admin)/dashboard/page.tsx
import { Box, Grid } from '@mui/material';
import { requirePageAccess } from '@/lib/supabase/auth/server';
import { fetchDashboardCards } from '@/features/dashboard/services/card.server';
import { fetchAllDashboardData } from '@/features/dashboard/services/dashboardchart.server';
import { fetchProductsSeries } from '@/features/dashboard/services/productsChart.server'; // ← yeni

import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import CardsGrid from '@/features/dashboard/components/CardsGrid.client';
import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';
import PieDonutChart from '@/components/ui/charts/PieChart.client';
import PremiumSection from '@/features/dashboard/components/PremiumSection.client';
import { get3RollingMonthRange, get6RollingMonthRange } from '@/features/dashboard/utils/rollingMonths';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePageAccess('dashboard');

  const [cards, data, productsSeries] = await Promise.all([
    fetchDashboardCards(),
    fetchAllDashboardData(),
    fetchProductsSeries(6), // ← ürünler (son 6 ay)
  ]);
  const { charts, systems3m, countries3m, statusPie } = data;

  const { labelTR: labelTR3 } = get3RollingMonthRange();
  const { labelTR: labelTR6 } = get6RollingMonthRange();

  return (
    <Box px={1} py={2}>
      <DashboardHeader />

      <CardsGrid data={cards} />
      
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Yeni Kullanıcılar" timeLabel={labelTR6}>
            <LineAreaChart
              labels={charts.users.labels}
              series={[{ label: 'Yeni kullanıcılar', data: charts.users.data, valueSuffix: ' kullanıcı' }]}
              height={320}
            />
          </ChartCard>
        </Grid>

        {/* ← 2. kart: ürünler line-area */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Yeni Ürünler" timeLabel={labelTR6}>
            <LineAreaChart
              labels={productsSeries.labels}
              series={[{ label: 'Yeni ürünler', data: productsSeries.data, valueSuffix: ' ürün' }]}
              height={320}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="Sistemlere Göre Talepler" timeLabel={labelTR3}>
            <GroupBarChart
              labels={countries3m.labels}
              series={countries3m.series.map((s) => ({ label: s.label, data: s.data }))}
              height={360}
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="Taleplerin Durum Dağılımı" timeLabel="Tüm Zamanlar">
            <PieDonutChart
              items={statusPie.items}
              donut
              height={360}
              showLegend
              arcLabelMode="percent"
              colorKeyByLabel={{ Bekleyen: 'warning', Onaylanan: 'success', Reddedilen: 'error' }}
            />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="Ülkelere Göre Talepler" timeLabel={labelTR3}>
            <GroupBarChart
              labels={systems3m.labels}
              series={systems3m.series.map((s) => ({ label: s.label, data: s.data }))}
              height={360}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <PremiumSection
            title="Premium Özelliğine Erişin"
            description="Gelişmiş raporlar, detaylı analizler ve öncelikli destekle daha hızlı ilerleyin."
            ctaLabel="Yükselt"
            href="/upgrade"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
