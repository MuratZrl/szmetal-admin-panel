// src/features/dashboard/components/StatsGrid.client.tsx
"use client";

import Grid from "@mui/material/Grid";
import StatCard from "@/components/ui/cards/StatCard";
import type { DashboardData } from "../../dashboard/types";

type Props = { data: DashboardData };

export default function StatsGrid({ data }: Props) {
  const { totals, trends } = data;
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Kullanıcı"
          value={totals.totalUsers}
          percentage={Math.abs(trends.user.change)}
          trend={trends.user.trend}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Aktif Talepler"
          value={totals.totalRequests}
          percentage={Math.abs(trends.request.change)}
          trend={trends.request.trend}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Toplam Sistem"
          value={totals.uniqueSystems}
          percentage={Math.abs(trends.system.change)}
          trend={trends.system.trend}
        />
      </Grid>
    </Grid>
  );
}
