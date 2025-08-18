// app/(admin)/clients/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Card, CardHeader, CardContent, Typography } from '@mui/material';

import StatCard from '../../../components/ui/cards/StatCard';
import MonthlyUserChart from '../../../components/ui/charts/MonthlyUserChart';
import GroupedBarChart from '../../../components/ui/charts/GroupedUserBarChart';

import { usersTableColumns } from '../constants/clients/columns';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../types/supabase';

// ******************************************************************************************

type User = Database['public']['Tables']['users']['Row'];

// ******************************************************************************************

export default function ClientPage() {

  const supabase = createClientComponentClient<Database>();

  // ******************************************************************************************

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ******************************************************************************************

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status?.toLowerCase() === 'active').length;
  const passiveUsers = users.filter((u) => u.status?.toLowerCase() === 'inactive').length;
  const bannedUsers = users.filter((u) => u.status?.toLowerCase() === 'banned').length;

  const { startOfThisMonth, startOfLastMonth, endOfLastMonth } = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startOfThisMonth, startOfLastMonth, endOfLastMonth };
  }, []);

  // ******************************************************************************************

  const [thisMonthUsers, setThisMonthUsers] = useState<User[]>([]);
  const [lastMonthUsers, setLastMonthUsers] = useState<User[]>([]);

  // ******************************************************************************************

  const thisMonthTotal = thisMonthUsers.length;
  const lastMonthTotal = lastMonthUsers.length;

  const totalChange =
    lastMonthTotal === 0
      ? thisMonthTotal > 0 ? 100 : 0
      : Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);

  const totalTrend = 
    thisMonthTotal > lastMonthTotal ? 'up'
    : thisMonthTotal < lastMonthTotal ? 'down'
    : undefined;

  // ******************************************************************************************

  const thisMonthActive = thisMonthUsers.filter(u => u.status === 'Active').length;
  const lastMonthActive = lastMonthUsers.filter(u => u.status === 'Active').length;

  const activeChange =
    lastMonthActive === 0
      ? thisMonthActive > 0 ? 100 : 0
      : Math.round(((thisMonthActive - lastMonthActive) / lastMonthActive) * 100);

  const activeTrend = 
    thisMonthActive > lastMonthActive ? 'up'
    : thisMonthActive < lastMonthActive ? 'down'
    : undefined;

  // ******************************************************************************************

  const thisMonthPassive = thisMonthUsers.filter(u => u.status === 'Inactive').length;
  const lastMonthPassive = lastMonthUsers.filter(u => u.status === 'Inactive').length;

  const passiveChange =
    lastMonthPassive === 0
      ? thisMonthPassive > 0
        ? 100 // Yeni pasif kullanıcılar varsa: %100 artış gibi kabul
        : 0   // Hiç pasif yoksa: değişiklik yok
      : Math.round(((thisMonthPassive - lastMonthPassive) / lastMonthPassive) * 100);

  const passiveTrend = 
    thisMonthPassive > lastMonthPassive ? 'up' 
    : thisMonthPassive < lastMonthPassive ? 'down'
    : undefined;

  // ******************************************************************************************

  const thisMonthBanned = thisMonthUsers.filter(u => u.status === 'Banned').length;
  const lastMonthBanned = lastMonthUsers.filter(u => u.status === 'Banned').length;

  const bannedChange =
    lastMonthBanned === 0
      ? thisMonthBanned > 0
        ? 100 // Yeni banlanmış kullanıcılar varsa: %100 artış gibi kabul
        : 0   // Hiç banlanmış yoksa: değişiklik yok
      : Math.round(((thisMonthBanned - lastMonthBanned) / lastMonthBanned) * 100);

  const bannedTrend = 
    thisMonthBanned > lastMonthBanned ? 'up' 
    : thisMonthBanned < lastMonthBanned ? 'down'
    : undefined;

  // ******************************************************************************************


  // useEffect hook'ları
  useEffect(() => {

    const fetchUsers = async () => {
      setLoading(true);

      // Toplam kullanıcılar
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*');

      // Bu ayın kullanıcıları
      const { data: thisMonthUsers, error: thisMonthError } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', startOfThisMonth.toISOString());

      // Geçen ayın kullanıcıları
      const { data: lastMonthUsers, error: lastMonthError } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString());

      if (allUsersError || thisMonthError || lastMonthError) {
        console.error('Veri alınamadı:', allUsersError || thisMonthError || lastMonthError);
        return;
      }

      setUsers(allUsers || []);
      setThisMonthUsers(thisMonthUsers || []);
      setLastMonthUsers(lastMonthUsers || []);
      setLoading(false);
    };

    fetchUsers();
  }, [supabase, endOfLastMonth, startOfLastMonth, startOfThisMonth]);

  // ******************************************************************************************

  // TSX
  return (
    <Box sx={{ py: { xs: 2, md: 4 } }} >

        {/* Stat Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard
              title="Toplam Kullanıcı"
              value={totalUsers}
              trend={totalTrend}
              percentage={Math.abs(totalChange)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard
              title="Aktif Kullanıcılar"
              value={activeUsers}
              trend={activeTrend}
              percentage={Math.abs(activeChange)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard
              title="Pasif Kullanıcılar"
              value={passiveUsers}
              trend={passiveTrend}
              percentage={Math.abs(passiveChange)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} >
            <StatCard
              title="Banlanan Kullanıcılar"
              value={bannedUsers}
              trend={bannedTrend}
              percentage={Math.abs(bannedChange)}
            />
          </Grid>
        </Grid>

        {/* DataGrid */}
        <DataGrid
          rows={users}
          columns={usersTableColumns}
          getRowId={(row) => row.id}
          loading={loading}
          autoHeight
          hideFooter
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          sx={{
            borderRadius: 5,
            '& .MuiDataGrid-columnHeader': {
              backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'white',
              fontWeight: 600,
            },
          }}
        />

        {/* Charts */}
        <Grid container spacing={2} mt={3}>
          <Grid size={{ xs: 12, md: 6 }} >
            <Card
              elevation={2}
              sx={{
                borderRadius: 7,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={600}>
                    Aylık Kullanıcı Artışı
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <MonthlyUserChart />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} >
            <Card
              elevation={2}
              sx={{
                borderRadius: 7,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={600}>
                    Aylara Göre Kullanıcı Statüsü
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <GroupedBarChart />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

    </Box>
  );
}
