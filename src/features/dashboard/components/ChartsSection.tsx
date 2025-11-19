// src/features/dashboard/components/ChartsSection.tsx
import * as React from 'react';
import { Grid } from '@mui/material';

import ChartCard from '@/components/ui/cards/ChartCard.client';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';
import PieDonutChart from '@/components/ui/charts/PieChart.client';

type LineChartData = {
  labels: string[];
  data: number[];
};

type GroupBarSeriesItem = {
  label: string;
  data: number[];
};

type GroupBarData = {
  labels: string[];
  series: GroupBarSeriesItem[];
};

type StatusPieItem = {
  label: string;
  value: number;
};

type StatusPie = {
  items: StatusPieItem[];
};

type ChartsSectionProps = {
  charts: {
    users: LineChartData;
  };
  productsSeries: LineChartData;
  systems3m: GroupBarData;
  countries3m: GroupBarData;
  statusPie: StatusPie;
  labelTR3: string;
  labelTR6: string;
};

export default function ChartsSection({
  charts,
  productsSeries,
  systems3m,
  countries3m,
  statusPie,
  labelTR3,
  labelTR6,
}: ChartsSectionProps) {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }} alignItems="stretch">

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Yeni Kullanıcılar" timeLabel={labelTR6}>
          <LineAreaChart
            labels={charts.users.labels}
            series={[
              {
                label: 'Yeni kullanıcılar',
                data: charts.users.data,
                valueSuffix: ' kullanıcı',
              },
            ]}
            height={320}
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title="Yeni Ürünler" timeLabel={labelTR6}>
          <LineAreaChart
            labels={productsSeries.labels}
            series={[
              {
                label: 'Yeni ürünler',
                data: productsSeries.data,
                valueSuffix: ' ürün',
              },
            ]}
            height={320}
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Sistemlere Göre Talepler" timeLabel={labelTR3}>
          <GroupBarChart
            labels={countries3m.labels}
            series={countries3m.series.map((s) => ({ label: s.label, data: s.data }))}
            height={360}
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Taleplerin Durum Dağılımı" timeLabel="Tüm Zamanlar">
          <PieDonutChart
            items={statusPie.items}
            donut
            height={360}
            showLegend
            arcLabelMode="percent"
            colorKeyByLabel={{
              Bekleyen: 'warning',
              Onaylanan: 'success',
              Reddedilen: 'error',
            }}
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Ülkelere Göre Talepler" timeLabel={labelTR3}>
          <GroupBarChart
            labels={systems3m.labels}
            series={systems3m.series.map((s) => ({ label: s.label, data: s.data }))}
            height={360}
          />
        </ChartCard>
      </Grid>
      
    </Grid>
  );
}
