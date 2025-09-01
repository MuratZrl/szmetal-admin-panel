// app/(admin)/dashboard/page.tsx
import { Box } from "@mui/material";
import { fetchDashboardData } from "@/features/dashboard/services/dashboard.server";
import StatsGrid from "@/features/dashboard/components/StatsGrid.client";
import ChartSection from "@/features/dashboard/components/ChartSection.client";

// Mevcut chart bileşenlerin:
import BasicArea from "@/components/ui/charts/DashboardAreaChart";
import BasicBars from "@/components/ui/charts/DashboardGroupedBarChart";
import SimpleCharts from "@/components/ui/charts/DashboardBarChart";
import MultiSeriesRadar from "@/components/ui/charts/DashboardRadarChart";
import DashboardStackedAreaChart from "@/components/ui/charts/DashboardStacktedAreaChart";

export const dynamic = "force-dynamic"; // veriler sık değişiyorsa işine yarar

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  return (
    <Box px={1} py={2} >

      {/* İstatistikler */}
      <StatsGrid data={data} />

      {/* Grafikler - 1 */}
      <ChartSection
        items={[
          { title: "Son 6 Ay Toplam Kullanıcı Grafiği", Component: BasicArea },
          { title: "Son 6 Ay Kullanıcı Rolü Grafiği", Component: BasicBars },
        ]}
      />

      {/* Ekstra Grafikler */}
      <ChartSection
        items={[
          { title: "Talep - Durum Grafiği", Component: DashboardStackedAreaChart },
          { title: "Talep - Ülke Grafiği", Component: MultiSeriesRadar },
          { title: "Talep - Sistem Grafiği", Component: SimpleCharts },
        ]}
      />
      
    </Box>
  );
}
