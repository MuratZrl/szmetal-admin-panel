'use client';
// src/features/dashboard/components/AluminiumChartCard.client.tsx

import * as React from 'react';
import { Box, CircularProgress, Grid } from '@mui/material';
import ChartCard from '@/components/ui/cards/ChartCard';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';

type MetalItem = {
  symbol: string;
  name: string;
  priceUSD: number;
  change: number;
  changePct: number;
  history: { labels: string[]; data: number[] };
};

type MetalsPayload = {
  available: true;
  metals: MetalItem[];
} | {
  available: false;
};

/**
 * Renders a 30-day aluminium price chart if enough history is available.
 * On the free tier (metals.dev) we only get spot price (no history),
 * so the chart is hidden when history has < 5 data points.
 * Upgrading to a paid tier with timeseries endpoint enables full chart.
 */
export default function AluminiumChartCard() {
  const [data, setData] = React.useState<MetalsPayload | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    fetch('/api/metals', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MetalsPayload>;
      })
      .then(payload => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setData({ available: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Find aluminum in the metals array
  const alu = data && data.available
    ? data.metals.find(m => m.symbol === 'ALU')
    : null;

  // Not available or not enough data for a chart → hide
  if (!loading && !alu) return null;
  if (!loading && alu && alu.history.data.length < 5) return null;

  // Loading — show skeleton while we check if chart data exists
  if (loading) {
    return (
      <Grid size={{ xs: 12 }}>
        <ChartCard title="LME Alüminyum Fiyatı" timeLabel="Yükleniyor...">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 280,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        </ChartCard>
      </Grid>
    );
  }

  // Type narrowing
  if (!alu) return null;

  const { history, priceUSD, change, changePct } = alu;

  const changeStr = change >= 0
    ? `+$${change.toLocaleString('en-US')}`
    : `-$${Math.abs(change).toLocaleString('en-US')}`;
  const pctStr = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;

  const dayCount = history.data.length;

  return (
    <Grid size={{ xs: 12 }}>
      <ChartCard
        title="LME Alüminyum Fiyatı"
        timeLabel={`Son ${dayCount} Gün • $${priceUSD.toLocaleString('en-US')}/t (${changeStr}, ${pctStr})`}
      >
        <LineAreaChart
          labels={history.labels}
          series={[
            {
              label: 'Alüminyum (USD/ton)',
              data: history.data,
              colorKey: 'warning',
              valueSuffix: ' $/t',
            },
          ]}
          height={280}
          yValueFormatter={(v: number) => `$${v.toLocaleString('en-US')}`}
        />
      </ChartCard>
    </Grid>
  );
}
