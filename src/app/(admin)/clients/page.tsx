// app/(admin)/clients/page.tsx
import { Box, Grid } from '@mui/material';

import { fetchClientsCards } from '@/features/clients/services/card.server';
import { fetchUsersAll } from '@/features/clients/services/table.server';
import { fetchClientsLine6M } from '@/features/clients/services/chart.server';

import CardsGrid from '@/features/clients/components/CardsGrid.client';
import TableGrid from '@/features/clients/components/TableGrid.client';

// DOĞRUDAN kart kabuğu (server-safe)
import ChartCard from '@/components/ui/cards/ChartCard.client';
// Grafik client bileşeni
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
// 2. Grafik client bileşeni
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';

// Dashboard’daki ile aynı zaman etiketi
import { get6RollingMonthRange } from '@/features/dashboard/utils/rollingMonths';

import { STATUS_OPTIONS, type AppStatus, STATUS_LABELS_TR } from '@/features/clients/constants/users';

export const revalidate = 60;

export default async function Page() {
  const [cards, line6m, rows] = await Promise.all([
    fetchClientsCards(),
    fetchClientsLine6M(),
    fetchUsersAll(), // yarın 50k kayıt olduğunda ağın ağlamasın, sonra pagination’a geçeceğiz
  ]);

  const { labelTR: labelTR6 } = get6RollingMonthRange();

  const STATUS_COLOR: Record<AppStatus, string> = {
    Active:   '#2e7d32', // success
    Inactive: '#ed6c02', // warning
    Banned:   '#d32f2f', // error
  };

  const barSeries: Parameters<typeof GroupBarChart>[0]['series'] =
    (STATUS_OPTIONS as readonly AppStatus[]).map(s => ({
      label: STATUS_LABELS_TR[s],
      data:  line6m.byStatus[s] ?? [],
      color: STATUS_COLOR[s],
    }));

  return (
    <Box px={1} py={2}>
      
      {/* 1) Üst stat kartları */}  
      <CardsGrid data={cards} />

      {/* 2) Grafikler (yan yana, doğrudan sayfada) */}
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Toplam Kullanıcılar" timeLabel={labelTR6}>
            <LineAreaChart
              labels={line6m.labels}
              series={[
                {
                  label: 'Toplam',
                  data: line6m.totalUsers,
                  area: true,
                  showMark: true,
                  valueSuffix: ' kullanıcı',
                },
              ]}
              height={320}
              grid={{ horizontal: true, vertical: false }}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Duruma Göre Toplam Kullanıcılar" timeLabel={labelTR6}>
            <GroupBarChart
              labels={line6m.labels}
              series={barSeries}
              height={320}
            />
          </ChartCard>
        </Grid>
      </Grid>

      {/* 3) Tablo */}
      <Box sx={{ mt: 2 }}>
        <TableGrid rows={rows} />
      </Box>
      
    </Box>
  );
}
