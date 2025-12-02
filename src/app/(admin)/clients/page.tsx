// app/(admin)/clients/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import * as React from 'react';
import { Box, Grid } from '@mui/material';

import { fetchClientsCards } from '@/features/clients/services/card.server';
import { fetchUsersAll } from '@/features/clients/services/table.server';
import { fetchClientsLine6M } from '@/features/clients/services/chart.server';

import CardsGrid from '@/features/clients/components/CardsGrid.client';
import TableGrid from '@/features/clients/components/TableGrid.client';

import ChartCard from '@/components/ui/cards/ChartCard';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart, { GroupSeries } from '@/components/ui/charts/GroupBarChart.client';

import {
  STATUS_OPTIONS,
  type AppStatus,
  STATUS_LABELS_TR,
} from '@/features/clients/constants/users';

import { requirePageAccess } from '@/lib/supabase/auth/guards.server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

// TableGrid’in beklediği rol tipi
import type { AppRole } from '@/features/clients/constants/columns';

function isAppRole(v: unknown): v is AppRole {
  return v === 'Admin' || v === 'Manager' || v === 'User';
}

export default async function Page() {
  // Statü önce, rol sonra. Inactive ise /account’a döner.
  await requirePageAccess('/clients');

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
    if (isAppRole(r)) myRole = r;
  }

  // "May - Eki" gibi aralık etiketi
  const first = line6m.labels[0] ?? '';
  const last = line6m.labels[line6m.labels.length - 1] ?? '';
  const rangeLabel = first && last ? `${first} - ${last}` : undefined;

  // Seri verisi (renksiz)
  const barSeries: GroupSeries[] =
    (STATUS_OPTIONS as readonly AppStatus[]).map((s) => ({
      label: STATUS_LABELS_TR[s],
      data: line6m.byStatus[s] ?? [],
    }));

  // Etikete karşılık gelen renk tokenları (tema çözecek)
  const colorKeyByLabel: Record<string, `$status.${AppStatus}`> = {
    [STATUS_LABELS_TR.Active]: '$status.Active',
    [STATUS_LABELS_TR.Inactive]: '$status.Inactive',
    [STATUS_LABELS_TR.Banned]: '$status.Banned',
  };

  return (
    <Box px={1} py={2}>
      {/* 1) Üst stat kartları */}
      <CardsGrid data={cards} />

      {/* 2) Grafikler */}
      <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Toplam Kullanıcılar" timeLabel={rangeLabel}>
            <LineAreaChart
              labels={line6m.labels}
              series={[
                { label: 'Toplam', data: line6m.totalUsers, area: true, showMark: true, valueSuffix: ' kullanıcı' },
              ]}
              height={320}
              grid={{ horizontal: true, vertical: false }}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Duruma Göre Toplam Kullanıcılar" timeLabel={rangeLabel}>
            <GroupBarChart
              labels={line6m.labels}
              series={barSeries}
              colorKeyByLabel={colorKeyByLabel}
              tone="solid"
              height={320}
            />
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
