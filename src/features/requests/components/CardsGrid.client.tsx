'use client';

import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import type { RequestsCardsData } from '@/features/requests/types';

type Props = { data?: RequestsCardsData };

export default function CardsGrid({ data }: Props) {
  if (!data) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Toplam Talepler" value={0} loading /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Bekleyen Talepler" value={0} loading /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard title="Kabul Edilen Talepler" value={0} loading /></Grid>
      </Grid>
    );
  }

  const { totals, trends, adds } = data;

  const hasTotPct = trends?.total?.change !== undefined && trends?.total?.change !== null;
  const hasPenPct = trends?.pending?.change !== undefined && trends?.pending?.change !== null;
  const hasAppPct = trends?.approved?.change !== undefined && trends?.approved?.change !== null;

  // Yüzde yoksa: bu ay 0 ise “Değişim yok”, >0 ise “Yeni”
  const emptyTotLabel = hasTotPct ? undefined : adds.total === 0 ? 'Değişim yok' : 'Yeni';
  const emptyPenLabel = hasPenPct ? undefined : adds.pending === 0 ? 'Değişim yok' : 'Yeni';
  const emptyAppLabel = hasAppPct ? undefined : adds.approved === 0 ? 'Değişim yok' : 'Yeni';

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Talepler"
          value={totals.total}
          percentage={trends?.total?.change ?? undefined}
          trend={trends?.total?.trend}
          delta={adds.total}                 // ← delta yerine bu ay eklenen
          emptyPctLabel={emptyTotLabel}
          color="primary"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Bekleyen Talepler"
          value={totals.pending}
          percentage={trends?.pending?.change ?? undefined}
          trend={trends?.pending?.trend}
          delta={adds.pending}               // ←
          emptyPctLabel={emptyPenLabel}
          color="warning"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Kabul Edilen Talepler"
          value={totals.approved}
          percentage={trends?.approved?.change ?? undefined}
          trend={trends?.approved?.trend}
          delta={adds.approved}              // ←
          emptyPctLabel={emptyAppLabel}
          color="success"
        />
      </Grid>
    </Grid>
  );
}
