'use client';
// features/clients/components/CardsGrid.client.tsx

import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import type { ClientsCardsData } from '@/features/clients/services/card.server';

type Props = { data: ClientsCardsData };

export default function CardsGrid({ data }: Props) {
  const { totals, trends, deltas } = data;

  // trends.* null ve delta===0 ise -> her iki ay da 0 => 'Değişim yok', yoksa 'Yeni'
  const emptyUsers = trends.users ? undefined : (deltas.users === 0 ? 'Değişim yok' : 'Yeni');
  const emptyActive = trends.active ? undefined : (deltas.active === 0 ? 'Değişim yok' : 'Yeni');
  const emptyBanned = trends.banned ? undefined : (deltas.banned === 0 ? 'Değişim yok' : 'Yeni');

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={totals.totalUsers}
          percentage={trends.users?.change}
          trend={trends.users?.trend}
          delta={deltas.users}
          emptyPctLabel={emptyUsers}
          color="primary"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Aktif Kullanıcı"
          value={totals.totalActiveUsers}
          percentage={trends.active?.change}
          trend={trends.active?.trend}
          delta={deltas.active}
          emptyPctLabel={emptyActive}
          color="success"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Banlanan Kullanıcı"
          value={totals.totalBannedUsers}
          percentage={trends.banned?.change}
          trend={trends.banned?.trend}
          delta={deltas.banned}
          emptyPctLabel={emptyBanned}
          color="error"
        />
      </Grid>
    </Grid>
  );
}
