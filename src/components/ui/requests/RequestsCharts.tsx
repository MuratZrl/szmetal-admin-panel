// src/components/requests/RequestsCharts.tsx
'use client';
import React from 'react';
import { Grid, Paper, Box } from '@mui/material';
import MonthlyRequestsChart from '@/components/ui/charts/MonthlyRequestChart';
import GroupedRequestedBarChart from '@/components/ui/charts/GroupedRequestBarChart';
import type { RequestsChartsProps } from '@/types/requests';

/**
 * RequestsCharts - Chart bileşenlerini sarmalayan, tek prop (rows) alan component.
 * page.tsx'den rows'ı geçir ve grafikler client tarafında render etsin.
 */
export default function RequestsCharts({ rows }: RequestsChartsProps) {
  return (
    <Grid container spacing={2} mt={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
          <Box mb={1}>
            <strong>Aylık Toplam Talepler</strong>
          </Box>
          <MonthlyRequestsChart rows={rows} />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
          <Box mb={1}>
            <strong>Son 3 Ay Statü Dağılımı</strong>
          </Box>
          <GroupedRequestedBarChart rows={rows} />
        </Paper>
      </Grid>
    </Grid>
  );
}
