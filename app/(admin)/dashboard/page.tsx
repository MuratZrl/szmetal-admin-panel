// app/(admin)/dashboard/page.tsx
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
// ********************************************************************************
import { Box, Grid, Card, Typography, Divider } from '@mui/material';
// ********************************************************************************
import StatCard from '../_components_/ui/cards/StatCard';
// ********************************************************************************
import BasicArea from '../_components_/ui/charts/DashboardAreaChart';
import BasicBars from '../_components_/ui/charts/DashboardGroupedBarChart';
// ********************************************************************************
import SimpleCharts from '../_components_/ui/charts/DashboardBarChart';
import MultiSeriesRadar from '../_components_/ui/charts/DashboardRadarChart';
import ScatterDataset from '../_components_/ui/charts/DashboardStacktedAresChart';
// ********************************************************************************
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../../../types/supabase';
// ********************************************************************************

export default function DashboardPage() {

  const supabase = createClientComponentClient<Database>();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [uniqueSystems, setUniqueSystems] = useState(0);

  // ********************************************************************************

  const now = useMemo(() => new Date(), []);

  const startOfThisMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const startOfLastMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);
  const endOfLastMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 0), [now]);

  // ********************************************************************************

  const [userChange, setUserChange] = useState(0);
  const [userTrend, setUserTrend] = useState<'up' | 'down' | undefined>();

  const [requestChange, setRequestChange] = useState(0);
  const [requestTrend, setRequestTrend] = useState<'up' | 'down' | undefined>();

  const [systemChange, setSystemChange] = useState(0);
  const [systemTrend, setSystemTrend] = useState<'up' | 'down' | undefined>();

  // ********************************************************************************

  const fetchDashboardStats = useCallback(async () => {
    // **********************************************************************

    // 1. Bu ay oluşturulan kullanıcılar
    const { data: thisMonthUsers } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', startOfThisMonth.toISOString());

    const { data: lastMonthUsers } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    const thisMonthUserCount = thisMonthUsers?.length ?? 0;
    const lastMonthUserCount = lastMonthUsers?.length ?? 0;

    // **********************************************************************

    // 2. Aktif talepler (bu ay)
    const { data: thisMonthRequests } = await supabase
      .from('requests')
      .select('id, status, created_at')
      .eq('status', 'pending')
      .gte('created_at', startOfThisMonth.toISOString());

    const { data: lastMonthRequests } = await supabase
      .from('requests')
      .select('id, status, created_at')
      .eq('status', 'pending')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())

    const thisMonthActiveCount = thisMonthRequests?.length ?? 0;
    const lastMonthActiveCount = lastMonthRequests?.length ?? 0;

    // **********************************************************************

    // 3. Sistem slug sayısı (unique) bu ay ve geçen ay
    const { data: thisMonthSystems } = await supabase
      .from('system_profiles')
      .select('system_slug, created_at')
      .gte('created_at', startOfThisMonth.toISOString());

    const { data: lastMonthSystems } = await supabase
      .from('system_profiles')
      .select('system_slug, created_at')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    const uniqueThisMonth = new Set(thisMonthSystems?.map(s => s.system_slug)).size;
    const uniqueLastMonth = new Set(lastMonthSystems?.map(s => s.system_slug)).size;

    // 🔁 Yüzde değişim hesapla
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // ✅ Stateleri güncelle
    setTotalUsers(thisMonthUserCount);
    setUserChange(calcChange(thisMonthUserCount, lastMonthUserCount));
    setUserTrend(thisMonthUserCount > lastMonthUserCount ? 'up' : thisMonthUserCount < lastMonthUserCount ? 'down' : undefined);

    setTotalRequests(thisMonthActiveCount);
    setRequestChange(calcChange(thisMonthActiveCount, lastMonthActiveCount));
    setRequestTrend(thisMonthActiveCount > lastMonthActiveCount ? 'up' : thisMonthActiveCount < lastMonthActiveCount ? 'down' : undefined);

    setUniqueSystems(uniqueThisMonth);
    setSystemChange(calcChange(uniqueThisMonth, uniqueLastMonth));
    setSystemTrend(uniqueThisMonth > uniqueLastMonth ? 'up' : uniqueThisMonth < uniqueLastMonth ? 'down' : undefined);
  }, [startOfThisMonth, startOfLastMonth, endOfLastMonth, supabase]);

  // ********************************************************************************

  // useEffect hook'ları
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // ********************************************************************************

  return (
    <Box px={1} py={2} >

      {/* İstatistik Kartları */}
      <Grid container spacing={2} >
        
        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Toplam Kullanıcı" value={totalUsers} percentage={Math.abs(userChange)} trend={userTrend} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Aktif Talepler" value={totalRequests} percentage={Math.abs(requestChange)} trend={requestTrend} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <StatCard title="Toplam Sistem" value={uniqueSystems} percentage={Math.abs(systemChange)} trend={systemTrend} />
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

      {/* Grafikler - 1 */}
      <Grid container spacing={2} mt={2} >

        <Grid size={{ xs: 12, sm: 6 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >

            <Typography
              variant='subtitle1'
              fontWeight={600}
              px={2}
            >
              Son 6 Ay Toplam Kullanıcı Grafiği
            </Typography>

            <Divider sx={{ my: 1 }} />

            <BasicArea />

          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >

            <Typography
              variant='subtitle1'
              fontWeight={600}
              px={2}
            >
              Son 6 Ay Kullanıcı Rolü Grafiği
            </Typography>

            <Divider sx={{ my: 1 }} />

            <BasicBars />
          </Card>
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

      {/* Ekstra Grafik Grubu */}
      <Grid container spacing={2} mt={2} >

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >

            <Typography
              variant='subtitle1'
              fontWeight={600}
              px={2}
            >
              Talep Durumu Grafiği
            </Typography>

            <Divider sx={{ my: 1 }} />

            <ScatterDataset />

          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >

            <Typography
              variant='subtitle1'
              fontWeight={600}
              px={2}
            >
              Talep - Ülke Grafiği
            </Typography>

            <Divider sx={{ my: 1 }} />

            <MultiSeriesRadar />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }} >
          <Card sx={{ p: 2, borderRadius: 7 }} >

            <Typography
              variant='subtitle1'
              fontWeight={600}
              px={2}
            >
              Talep - Sistem Grafiği
            </Typography>

            <Divider sx={{ my: 1 }} />

            <SimpleCharts />
          </Card>
        </Grid>

      </Grid>

      {/* **************************************************************************************************** */}

    </Box>
  );
}
