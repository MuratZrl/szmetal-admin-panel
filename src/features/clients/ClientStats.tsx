// src/features/clients/ClientStats.tsx
import Grid from "@mui/material/Grid"; // size={{ xs, sm, md }} için Grid v2 kullan
import StatCard from "@/components/ui/cards/StatCard";
import type { UsersTotals } from "@/features/clients/types";

export default function ClientStats({ totals }: { totals: UsersTotals }) {
  const totalTrend = totals.changePct > 0 ? "up" : totals.changePct < 0 ? "down" : undefined;
  const totalPct = Math.abs(totals.changePct);

  return (
    <Grid container spacing={2} mb={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={totals.total}
          percentage={totalPct}
          trend={totalTrend}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard title="Aktif Kullanıcılar" value={totals.active} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard title="Pasif Kullanıcılar" value={totals.inactive} />
      </Grid>
    </Grid>
  );
}
