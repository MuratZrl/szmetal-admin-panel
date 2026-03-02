'use client';
// src/features/dashboard/components/DashboardContent.client.tsx

import * as React from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { MotionContainer, MotionItem } from '@/components/ui/motion';
import type { DateRangeKey, DashboardPayload } from '../types/dashboardData';

import ChartCard from '@/components/ui/cards/ChartCard';
import GaugeChart from '@/components/ui/charts/GaugeChart.client';
import ChartRangeSelect from './ChartRangeSelect.client';
import CardsGrid from './CardsSection.client';
import AluminiumChartCard from './AluminiumChartCard.client';
import ChartsSection from './ChartsSection.client';

type Props = {
  headerSlot: React.ReactNode;
  activitySlot: React.ReactNode;
  initialData: DashboardPayload;
  initialRange: DateRangeKey;
};

/* ── Animated border wrapper for Müşteri Kalıbı card ── */
function GaugeCardWrapper({ rate, children }: { rate: number; children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const borderColor = theme.palette.warning.main;

  const dim = alpha(borderColor, isDark ? 0.12 : 0.08);
  const mid = alpha(borderColor, isDark ? 0.6 : 0.4);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: 2.5,
        padding: '1.5px',
        overflow: 'hidden',

        // Rotating conic-gradient — the "traveling light"
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          background: `conic-gradient(
            from 0deg,
            ${dim} 0%,
            ${dim} 68%,
            ${mid} 76%,
            ${borderColor} 80%,
            ${mid} 84%,
            ${dim} 92%,
            ${dim} 100%
          )`,
          animation: 'borderTravel 3.5s linear infinite',
          zIndex: 0,
        },

        // Soft outer glow that pulses
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          boxShadow: `0 0 18px ${alpha(borderColor, isDark ? 0.1 : 0.06)}`,
          animation: 'borderPulse 3s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        },

        '@keyframes borderTravel': {
          '0%':   { transform: 'translate(-50%,-50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%,-50%) rotate(360deg)' },
        },
        '@keyframes borderPulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%':      { opacity: 1 },
        },

        // Card sits on top, covering the center — only the 1.5px gap shows the gradient
        '& > .MuiCard-root': {
          position: 'relative',
          zIndex: 1,
          height: '100%',
          borderRadius: 'inherit',
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function DashboardContent({
  headerSlot,
  activitySlot,
  initialData,
  initialRange,
}: Props) {
  const [activeRange, setActiveRange] = React.useState<DateRangeKey>(initialRange);
  const [data, setData] = React.useState<DashboardPayload>(initialData);
  const [loading, setLoading] = React.useState(false);
  const cacheRef = React.useRef(new Map<DateRangeKey, DashboardPayload>([[initialRange, initialData]]));

  const handleRangeChange = React.useCallback((key: DateRangeKey) => {
    setActiveRange(key);

    // Use cache if available
    const cached = cacheRef.current.get(key);
    if (cached) {
      setData(cached);
      return;
    }

    // Fetch from API
    let cancelled = false;
    setLoading(true);

    fetch(`/api/dashboard?range=${key}`)
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json() as Promise<DashboardPayload>;
      })
      .then(payload => {
        if (cancelled) return;
        cacheRef.current.set(key, payload);
        setData(payload);
      })
      .catch(err => {
        if (!cancelled) console.error('Dashboard fetch error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Per-chart state for Müşteri Kalıbı Oranı
  const [gaugeRange, setGaugeRange] = React.useState<DateRangeKey>('allTime');
  const [gaugeRate, setGaugeRate] = React.useState(data.customerMoldRate);
  const [gaugeMoldCount, setGaugeMoldCount] = React.useState(data.customerMoldCount);
  const [gaugeLoading, setGaugeLoading] = React.useState(false);
  const gaugeInitialRef = React.useRef(true);

  React.useEffect(() => {
    if (gaugeInitialRef.current) {
      gaugeInitialRef.current = false;
      return;
    }

    let cancelled = false;
    setGaugeLoading(true);

    fetch(`/api/dashboard/chart?chart=customerMold&range=${gaugeRange}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json() as Promise<{ data: { rate: number; moldCount: number } }>;
      })
      .then((res) => {
        if (!cancelled) {
          setGaugeRate(res.data.rate);
          setGaugeMoldCount(res.data.moldCount);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Gauge fetch error:', err);
      })
      .finally(() => {
        if (!cancelled) setGaugeLoading(false);
      });

    return () => { cancelled = true; };
  }, [gaugeRange]);

  return (
    <MotionContainer style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <MotionItem>{headerSlot}</MotionItem>

      <MotionItem>
        <CardsGrid
          data={data.cards}
          userSparkData={data.usersSeries.data}
          productSparkData={data.productsSeries.data}
          loading={loading}
        />
      </MotionItem>

      <MotionItem style={{ marginTop: 8 }}>
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8 }}>
            {activitySlot}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <GaugeCardWrapper rate={gaugeRate}>
              <ChartCard
                title="Müşteri Kalıbı Oranı"
                right={
                  <ChartRangeSelect
                    value={gaugeRange}
                    onChange={setGaugeRange}
                    disabled={gaugeLoading}
                  />
                }
              >
                <Box sx={{ position: 'relative' }}>
                  {gaugeLoading && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, bgcolor: 'rgba(255,255,255,0.4)', borderRadius: 1 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <GaugeChart
                    value={gaugeRate}
                    label="Müşteri Kalıbı Profilleri"
                    color="warning"
                    height={325}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      mt: -0.5,
                      fontWeight: 700,
                      color: 'text.secondary',
                      fontSize: 13,
                    }}
                  >
                    {gaugeMoldCount} ürün
                  </Typography>
                </Box>
              </ChartCard>
            </GaugeCardWrapper>
          </Grid>
        </Grid>
      </MotionItem>

      <MotionItem>
        <AluminiumChartCard />
      </MotionItem>

      <MotionItem>
        <ChartsSection data={data} loading={loading} />
      </MotionItem>
    </MotionContainer>
  );
}
