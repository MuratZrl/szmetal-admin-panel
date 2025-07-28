'use client';

import { Box, Grid } from '@mui/material';

import StatCard from '../_components_/ui/cards/StatCard';

export default function DashboardPage() {
  return (

    <Box px={1} py={2} >

      <Grid container spacing={2} >

        {/* 1. Kart */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard
            title="Toplam Kullanıcı"
            value={1200}
            percentage={8.2}
            trend="up"
          />
        </Grid>

        {/* 2. Kart */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard
            title="Aktif Talepler"
            value={347}
            percentage={-3.5}
            trend="down"
          />
        </Grid>

        {/* 3. Kart */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard
            title="Yeni Kayıtlar (Bu Ay)"
            value={78}
            percentage={12.9}
            trend="up"
          />
        </Grid>

      </Grid>
      
    </Box>
  );
}
