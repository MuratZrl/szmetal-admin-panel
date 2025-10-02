// app/(admin)/clients/page.tsx
import { Box, Grid } from '@mui/material';

import { fetchClientsCards } from '@/features/clients/services/card.server';
import { fetchUsersAll } from '@/features/clients/services/table.server';
import { fetchClientsLine6M } from '@/features/clients/services/chart.server';

import CardsGrid from '@/features/clients/components/CardsGrid.client';
import TableGrid from '@/features/clients/components/TableGrid.client';

import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';

import { get6RollingMonthRange } from '@/features/dashboard/utils/rollingMonths';

import {
  STATUS_OPTIONS,
  type AppStatus,
  STATUS_LABELS_TR,
} from '@/features/clients/constants/users';

import { requirePageAccess } from '@/lib/supabase/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

// DİKKAT: doğru import yolu
import AccessAutoRedirect from '@/features/auth/AccessAuthRedirect.client';

// TableGrid’in beklediği rol tipi
import type { AppRole } from '@/features/clients/constants/columns';

export const revalidate = 60;

function isAppRole(v: unknown): v is AppRole {
  return v === 'Admin' || v === 'Manager' || v === 'User';
}

export default async function Page() {
  // Bu sayfaya kimler girebilir? (Admin, Manager)
  await requirePageAccess('clients');

  const [cards, line6m, rows] = await Promise.all([
    fetchClientsCards(),
    fetchClientsLine6M(),
    fetchUsersAll(),
  ]);

  // Oturum sahibi
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  const selfUserId = auth?.user?.id ?? null;

  // Kendi rolünü DB'den oku (public.users)
  let myRole: AppRole = 'User';
  if (selfUserId) {
    const { data } = await sb
      .from('users')
      .select('role')
      .eq('id', selfUserId)
      .returns<{ role: string }[]>();

    const r = data?.[0]?.role ?? null;
    if (isAppRole(r)) {
      myRole = r;
    }
  }

  const { labelTR: labelTR6 } = get6RollingMonthRange();

  const STATUS_COLOR: Record<AppStatus, string> = {
    Active: '#2e7d32',
    Inactive: '#ed6c02',
    Banned: '#d32f2f',
  };

  const barSeries: Parameters<typeof GroupBarChart>[0]['series'] =
    (STATUS_OPTIONS as readonly AppStatus[]).map((s) => ({
      label: STATUS_LABELS_TR[s],
      data: line6m.byStatus[s] ?? [],
      color: STATUS_COLOR[s],
    }));

  return (
    <Box px={1} py={2}>
      {/* Oturum sahibini canlı izle; yetki düşerse anında yönlendir */}
      <AccessAutoRedirect selfUserId={selfUserId} />

      {/* 1) Üst stat kartları */}
      <CardsGrid data={cards} />

      {/* 2) Grafikler */}
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
            <GroupBarChart labels={line6m.labels} series={barSeries} height={320} />
          </ChartCard>
        </Grid>
      </Grid>

      {/* 3) Tablo */}
      <Box sx={{ mt: 2 }}>
        <TableGrid rows={rows} selfUserId={selfUserId} myRole={myRole} />
      </Box>
    </Box>
  );
}
