// app/(admin)/dashboard/page.tsx
'use client';

import { Box, Grid, Card } from '@mui/material';
// ********************************************************************************
import StatCard from '../_components_/ui/cards/StatCard';
// ********************************************************************************
import BasicArea from '../_components_/ui/charts/DashboardAreaChart';
import BasicBars from '../_components_/ui/charts/DashboardGroupedBarChart';
// ********************************************************************************
import SimpleCharts from '../_components_/ui/charts/DashboardBarChart';
import MultiSeriesRadar from '../_components_/ui/charts/DashboardRadarChart';
import ScatterDataset from '../_components_/ui/charts/DashboardScatterChart';
// ********************************************************************************


export default function DashboardPage() {
  return (
    <Box px={1} py={2} >

      {/* İstatistik Kartları */}
      <Grid container spacing={2} >
        
        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Toplam Kullanıcı" value={1200} percentage={8.2} trend="up" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Aktif Talepler" value={347} percentage={-3.5} trend="down" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Yeni Kayıtlar (Bu Ay)" value={78} percentage={12.9} trend="up" />
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

      {/* Grafikler - 1 */}
      <Grid container spacing={2} mt={2} >

        <Grid size={{ xs: 12, sm: 6 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >
            <BasicArea />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >
            <BasicBars />
          </Card>
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

      {/* Ekstra Grafik Grubu */}
      <Grid container spacing={2} mt={2} >

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >
            <ScatterDataset />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >
            <MultiSeriesRadar />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >
            <SimpleCharts />
          </Card>
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

    </Box>
  );
}
