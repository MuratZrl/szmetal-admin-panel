// app/(admin)/requests/page.tsx
'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { Box, Paper, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import StatCard from '../../../components/ui/cards/StatCard';

import { RequestRowUnion } from '../types/requestsTypes';
import { getRequestsColumns } from '../constants/requests/columns';

import MonthlyRequestsChart from '../../../components/ui/charts/MonthlyRequestChart';
import GroupedRequestedBarChart from '../../../components/ui/charts/GroupedRequestBarChart';

import { supabase } from '../../../lib/supabase/supabaseClient';

// ******************************************************************************************

export default function RequestPage() {

  const router = useRouter();

  const [rows, setRows] = useState<RequestRowUnion[]>([]);
  const [loading, setLoading] = useState(true);

  // ******************************************************************************************

  const handleViewDetail = (id: string) => {
    router.push(`/requests/${id}`);
  };

  // ******************************************************************************************

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // ******************************************************************************************

  // Bu ayki toplam talepler
  const currentMonthRequests = rows.filter((r) => {
    const date = new Date(r.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  // ******************************************************************************************

  // Geçen ayki toplam talepler
  const lastMonthRequests = rows.filter((r) => {
    const date = new Date(r.created_at);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }).length;

  // ******************************************************************************************

  // Geçen ayki bekleyen talepler
  const lastMonthPendingCount = rows.filter((r) => {
    const date = new Date(r.created_at);
    return (
      date.getMonth() === lastMonth &&
      date.getFullYear() === lastMonthYear &&
      r.status === 'pending'
    );
  }).length;

  // ******************************************************************************************

  // Toplam talep artış/azalış yönü
  const totalTrend = rows.length >= lastMonthRequests ? 'up' : 'down';

  // Toplam taleplerde geçen aya göre yüzdelik değişim
  const totalPercentage =
    lastMonthRequests === 0
      ? 100
      : Math.abs(
          Math.round(((rows.length - lastMonthRequests) / lastMonthRequests) * 100)
        );

  // ******************************************************************************************

  // Bu ayki taleplerin trendi (geçen aya göre)
  const trend = currentMonthRequests >= lastMonthRequests ? 'up' : 'down';

  // Bu ayki taleplerin yüzde farkı (geçen aya göre)
  const percentage =
    lastMonthRequests === 0
      ? 100
      : Math.abs(
          Math.round(
            ((currentMonthRequests - lastMonthRequests) / lastMonthRequests) * 100
          )
        );

  // ******************************************************************************************

  // Şu anki bekleyen talepler
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  // Bekleyen taleplerde artış/azalış yönü
  const pendingTrend = pendingCount >= lastMonthPendingCount ? 'up' : 'down';

  // Bekleyen taleplerde geçen aya göre yüzdelik değişim
  const pendingPercentage =
    lastMonthPendingCount === 0
      ? 100
      : Math.abs(
          Math.round(
            ((pendingCount - lastMonthPendingCount) / lastMonthPendingCount) * 100
          )
        );

  // ******************************************************************************************

  // "requests" table üzerinden verileri çeken fonksiyon
  const fetchRequests = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users (
          username,
          email,
          company
        )
      `);

    if (error) {
      console.error('Veriler alınamadı:', error);

    } else {
      setRows(data as RequestRowUnion[]);
    }

    setLoading(false);
  };

  // ******************************************************************************************

  // useEffect hook'ları
  useEffect(() => {
    fetchRequests();
  }, []);

  // ******************************************************************************************

  // TSX
  return (
    <Box sx={{ py: { xs: 2, sm: 4 } }}>

        {/* Stat Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <StatCard
              title="Toplam Talep"
              value={rows.length}
              trend={totalTrend}
              percentage={totalPercentage}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <StatCard
              title="Bu Ay Toplam Talepler"
              value={currentMonthRequests}
              trend={trend}
              percentage={percentage}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <StatCard
              title="Bu Ay Bekleyen Talepler"
              value={pendingCount}
              trend={pendingTrend}
              percentage={pendingPercentage}
            />
          </Grid>
        </Grid>

        {/* DataGrid */}
        <DataGrid
          rows={rows}
          columns={getRequestsColumns(handleViewDetail)}
          getRowId={(row) => row.id}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
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
        <Grid container spacing={2} mt={3} >
          <Grid size={{ xs: 12, sm: 6 }} >
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
              <Box mb={1}>
                <strong>Aylık Toplam Talepler</strong>
              </Box>
              <MonthlyRequestsChart rows={rows} />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} >
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
              <Box mb={1}>
                <strong>Son 3 Ay Statü Dağılımı</strong>
              </Box>
              <GroupedRequestedBarChart rows={rows} />
            </Paper>
          </Grid>
        </Grid>
        
    </Box>
  );

}
