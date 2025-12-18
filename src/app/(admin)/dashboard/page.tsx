// app/(admin)/dashboard/page.tsx
import { Box } from '@mui/material';
import { requirePageAccess } from '@/lib/supabase/auth/guards.server';
import { fetchDashboardCards } from '@/features/dashboard/services/card.server';
import { fetchAllDashboardData } from '@/features/dashboard/services/dashboardchart.server';
import { fetchProductsSeries } from '@/features/dashboard/services/productsChart.server';

import DashboardHeader from '@/features/dashboard/components/DashboardHeaderSection';
import CardsGrid from '@/features/dashboard/components/CardsSection.client';
import ChartsSection from '@/features/dashboard/components/ChartsSection';
import { get3RollingMonthRange, get6RollingMonthRange } from '@/features/dashboard/utils/rollingMonths';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePageAccess('/dashboard');

  const [cards, data, productsSeries] = await Promise.all([
    fetchDashboardCards(),
    fetchAllDashboardData(),
    fetchProductsSeries(6),
  ]);

  const { charts, systems3m, countries3m, statusPie } = data;

  const { labelTR: labelTR3 } = get3RollingMonthRange();
  const { labelTR: labelTR6 } = get6RollingMonthRange();

  return (
    <Box px={1} py={2}>
      <DashboardHeader />

      <CardsGrid data={cards} />

      <ChartsSection
        charts={charts}
        productsSeries={productsSeries}
        systems3m={systems3m}
        countries3m={countries3m}
        statusPie={statusPie}
        labelTR3={labelTR3}
        labelTR6={labelTR6}
      />
    </Box>
  );
}
