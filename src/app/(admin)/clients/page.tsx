'use client';
import { Box, Grid, Card, CardHeader, CardContent, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import UsersDataGrid from '@/components/ui/clients/UsersDataGrid';
import ClientStats from '@/features/clients/ClientStats';
import MonthlyUserChart from '@/components/ui/charts/MonthlyUserChart';
import GroupedBarChart from '@/components/ui/charts/GroupedUserBarChart';
import { usersTableColumns } from '@/constants/clients/columns';

import { useUsers } from '@/hooks/useUsers';

export default function ClientPage() {
  const { users, loading, totals, refresh } = useUsers();

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header + Refresh */}
      <Grid container alignItems="center" justifyContent="space-between" mb={2} >

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" fontWeight={700}>Kullanıcılar</Typography>
          <Typography variant="body2" color="text.secondary">Genel bakış</Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Tooltip title="Yenile">
            <span>
              <IconButton
                onClick={() => { void refresh(); }}
                disabled={loading}
                aria-label="refresh"
                size="large"
              >
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <ClientStats totals={totals} />

      <UsersDataGrid rows={users} columns={usersTableColumns} loading={loading} />

      <Grid container spacing={2} mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: 7, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title={<Typography variant="h6" fontWeight={600}>Aylık Kullanıcı Artışı</Typography>} />
            <CardContent sx={{ flexGrow: 1 }}>
              <MonthlyUserChart />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: 7, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader title={<Typography variant="h6" fontWeight={600}>Aylara Göre Kullanıcı Statüsü</Typography>} />
            <CardContent sx={{ flexGrow: 1 }}>
              <GroupedBarChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
}
