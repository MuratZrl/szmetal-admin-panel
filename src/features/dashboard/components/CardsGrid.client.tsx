// src/features/dashboard/components/CardsGrid.client.tsx
'use client';

import { Grid } from '@mui/material';
import StatCard from '@/components/ui/cards/StatCard.client';
import type { CardsData } from '@/features/dashboard/services/card.server';

type Props = { data: CardsData };

// Yüzde 0 geldiğinde "yüzde gösterme" ki boş etiket devreye girsin.
function pctOrUndefined(t?: { change: number | null } | null): number | undefined {
  if (!t || t.change == null) return undefined;
  return t.change > 0 ? t.change : undefined; // 0 ise undefined döner
}

export default function CardsGrid({ data }: Props) {
  const { totals, trends, deltas } = data;

  const userPct = pctOrUndefined(trends.user);
  const reqPct  = pctOrUndefined(trends.request);
  const prodPct = pctOrUndefined(trends.product);

  const emptyUserLabel = userPct === undefined ? (deltas.user > 0 ? 'Yeni' : 'Değişim yok') : undefined;
  const emptyReqLabel  = reqPct  === undefined ? (deltas.request > 0 ? 'Yeni' : 'Değişim yok') : undefined;
  const emptyProdLabel = prodPct === undefined ? (deltas.product > 0 ? 'Yeni' : 'Değişim yok') : undefined;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={totals.totalUsers}
          percentage={userPct}
          trend={trends.user?.trend}
          delta={deltas.user}
          emptyPctLabel={emptyUserLabel}
          color="primary"
          detailsHref="/clients"      // ← 1. kart: /clients
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Aktif Talep (Bekleyen)"
          value={totals.totalPendingRequests}
          percentage={reqPct}
          trend={trends.request?.trend}
          delta={deltas.request}
          emptyPctLabel={emptyReqLabel}
          color="warning"
          detailsHref="/requests"     // ← 2. kart: /requests
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Ürünler"
          value={totals.totalProducts}
          percentage={prodPct}
          trend={trends.product?.trend}
          delta={deltas.product}
          emptyPctLabel={emptyProdLabel}
          color="info"
          detailsHref="/products"     // ← 3. kart: /products
        />
      </Grid>
    </Grid>
  );
}
