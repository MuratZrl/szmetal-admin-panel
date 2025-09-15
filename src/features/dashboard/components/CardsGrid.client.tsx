// src/features/dashboard/components/CardsGrid.client.tsx
'use client';

import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import { CardsData } from '@/features/dashboard/services/card.server';

type Props = { data: CardsData };

export default function CardsGrid({ data }: Props) {
  const { totals, trends, deltas } = data;

    // yüzde var mı? (null/undefined değilse var say)
  const hasUserPct = trends.user?.change !== undefined && trends.user?.change !== null;
  const hasReqPct  = trends.request?.change !== undefined && trends.request?.change !== null;
  const hasSysPct  = trends.system?.change !== undefined && trends.system?.change !== null;

  // boş yüzde durumunda yazılacak etiket
  const emptyUserLabel = hasUserPct ? undefined : (deltas.user === 0 ? 'Değişim yok' : 'Yeni');
  const emptyReqLabel  = hasReqPct  ? undefined : (deltas.request === 0 ? 'Değişim yok' : 'Yeni');
  const emptySysLabel  = hasSysPct  ? undefined : (deltas.system === 0 ? 'Değişim yok' : 'Yeni');

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={totals.totalUsers}
          percentage={trends.user?.change ?? undefined}
          trend={trends.user?.trend}
          delta={deltas.user}
          emptyPctLabel={emptyUserLabel}
          color="primary"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Aktif Talep (Bekleyen)"
          value={totals.totalPendingRequests}
          percentage={trends.request?.change ?? undefined}
          trend={trends.request?.trend}
          delta={deltas.request}
          emptyPctLabel={emptyReqLabel}
          color="warning"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Sistem"
          value={totals.totalSystems}
          percentage={trends.system?.change ?? undefined}
          trend={trends.system?.trend}
          delta={deltas.system}
          emptyPctLabel={emptySysLabel}
          color="info"
        />
      </Grid>
    </Grid>
  );
}
