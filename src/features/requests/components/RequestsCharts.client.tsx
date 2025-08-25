'use client';
import React, { useMemo } from 'react';
import { Grid, Paper, Box } from '@mui/material';
import MonthlyRequestsChart from '@/components/ui/charts/MonthlyRequestChart';
import GroupedRequestedBarChart from '@/components/ui/charts/GroupedRequestBarChart';
import type { RequestRowUnion } from '@/types/requests'; // dosya adını projende tutarlı yap
import type { ChartRow } from '@/types/chart';

function mapToMinimal(rows: RequestRowUnion[]): ChartRow[] {
  return rows.map(r => ({
    id: r.id,
    created_at: r.created_at,
    status: r.status,
    system_slug: r.system_slug,
  }));
}

export default function RequestsCharts({ rows }: { rows: RequestRowUnion[] }) {
  // memoize: parent yeniden renderlansa bile mapping tekrar çalışmaz
  const minimal = useMemo(() => mapToMinimal(rows), [rows]);

  // sadece belirli system_slug isteyen chart
  const giyotinMinimal = useMemo(() => minimal.filter(r => r.system_slug === 'giyotin-sistemi'), [minimal]);

  return (
    <Grid container spacing={2} mt={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
          <Box mb={1}><strong>Aylık Toplam Talepler</strong></Box>
          <MonthlyRequestsChart rows={minimal} />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
          <Box mb={1}><strong>Son 3 Ay Statü Dağılımı</strong></Box>
          <GroupedRequestedBarChart rows={giyotinMinimal} />
        </Paper>
      </Grid>
    </Grid>
  );
}
