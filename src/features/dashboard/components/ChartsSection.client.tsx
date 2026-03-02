'use client';
// src/features/dashboard/components/ChartsSection.client.tsx

import * as React from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';

import ChartCard from '@/components/ui/cards/ChartCard';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import CategoryDonutChart from '@/components/ui/charts/CategoryDonutChart.client';
import ChartRangeSelect from './ChartRangeSelect.client';
import type { DashboardPayload, DateRangeKey, SeriesData, CategoryPieData } from '../types/dashboardData';

type Props = {
  data: DashboardPayload;
  loading?: boolean;
};

function useChartData<T>(
  chartKey: string,
  initialData: T,
  defaultRange: DateRangeKey,
) {
  const [range, setRange] = React.useState<DateRangeKey>(defaultRange);
  const [data, setData] = React.useState<T>(initialData);
  const [chartLoading, setChartLoading] = React.useState(false);
  const initialRef = React.useRef(true);

  React.useEffect(() => {
    // Skip fetch on initial mount — we already have data from props
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    let cancelled = false;
    setChartLoading(true);

    fetch(`/api/dashboard/chart?chart=${chartKey}&range=${range}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json() as Promise<{ data: T; timeLabel: string }>;
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) console.error(`Chart fetch error (${chartKey}):`, err);
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });

    return () => { cancelled = true; };
  }, [chartKey, range]);

  return { range, setRange, data, chartLoading };
}

export default function ChartsSection({ data, loading }: Props) {
  const users = useChartData<SeriesData>('users', data.usersSeries6m, 'thisMonth');
  const products = useChartData<SeriesData>('products', data.productsSeries6m, 'thisMonth');
  const categoryPie = useChartData<CategoryPieData>('categoryPie', data.categoryPieAllTime, 'allTime');

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.4)',
            borderRadius: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Grid
        container
        spacing={2}
        sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}
        alignItems="stretch"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Yeni Kullanıcılar"
            right={
              <ChartRangeSelect
                value={users.range}
                onChange={users.setRange}
                disabled={users.chartLoading}
              />
            }
          >
            <Box sx={{ position: 'relative' }}>
              {users.chartLoading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <LineAreaChart
                labels={users.data.labels}
                series={[{ label: 'Yeni kullanıcılar', data: users.data.data, valueSuffix: ' kullanıcı' }]}
                height={320}
              />
            </Box>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Yeni Ürünler"
            right={
              <ChartRangeSelect
                value={products.range}
                onChange={products.setRange}
                disabled={products.chartLoading}
              />
            }
          >
            <Box sx={{ position: 'relative' }}>
              {products.chartLoading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <LineAreaChart
                labels={products.data.labels}
                series={[{ label: 'Yeni ürünler', data: products.data.data, valueSuffix: ' ürün' }]}
                height={320}
              />
            </Box>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Profil Kategori Dağılımı"
            right={
              <ChartRangeSelect
                value={categoryPie.range}
                onChange={categoryPie.setRange}
                disabled={categoryPie.chartLoading}
              />
            }
          >
            <Box sx={{ position: 'relative' }}>
              {categoryPie.chartLoading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <CategoryDonutChart items={categoryPie.data.items} height={280} />
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
