import React from 'react';
import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard';
import { ClientTotals } from '@/types/clients';

export default function ClientStats({ totals }: { totals: ClientTotals }) {
  return (
    <Grid container spacing={2} mb={3} >
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Toplam Kullanıcı" value={totals.totalUsers} trend={totals.totalTrend} percentage={totals.totalChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Aktif Kullanıcılar" value={totals.activeUsers} trend={totals.activeTrend} percentage={totals.activeChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Pasif Kullanıcılar" value={totals.passiveUsers} trend={totals.passiveTrend} percentage={totals.passiveChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Banlanan Kullanıcılar" value={totals.bannedUsers} trend={totals.bannedTrend} percentage={totals.bannedChange} />
      </Grid>
    </Grid>
  );
}
