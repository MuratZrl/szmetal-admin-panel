// src/features/products_analytics/ChartsSection.tsx
import { Grid } from '@mui/material';

import ChartCard from '@/components/ui/cards/ChartCard';
import LineAreaChart from '@/components/ui/charts/LineAreaChart.client';
import PieDonutChart from '@/components/ui/charts/PieChart.client';
import GroupBarChart from '@/components/ui/charts/GroupBarChart.client';

import {
  getMonthlyProductsSeries,
  getVariantDistribution,
  getCategoryDistribution,
  getMonthlyVariantSeries,
} from '@/features/products_analytics/services/charts.server';

export default async function ChartsSection() {
  const [monthly, variants, categories, variantsMonthly] = await Promise.all([
    getMonthlyProductsSeries(12),
    getVariantDistribution(),
    getCategoryDistribution(),
    getMonthlyVariantSeries(12),
  ]);

  const variantSeries = variantsMonthly.items;

  return (
    <Grid
      container
      spacing={2}
      sx={{ mb: 3 }}
    >
      {/* Üst satır: toplam aylık line + kategori pie */}
      <Grid size={{ xs: 12, md: 8 }}>
        <ChartCard title="Aylık Toplam Ürün Sayısı" timeLabel="Son 12 ay">
          <LineAreaChart
            labels={monthly.labels}
            series={[
              {
                label: 'Müşteri Kalıbı',
                data: monthly.withCustomerMold,
                valueSuffix: ' ürün',
              },
              {
                label: 'Müşteri Kalıbı Değil',
                data: monthly.withoutCustomerMold,
                valueSuffix: ' ürün',
              },
            ]}
            height={350}
            grid={{ horizontal: true, vertical: false }}
            colorKeyByLabel={{
              'Müşteri Kalıbı': 'success',
              'Müşteri Kalıbı Değil': 'info',
            }}
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Kategoriye Göre Ürün Sayısı" timeLabel="Tüm ürünler">
          <PieDonutChart
            items={categories.items}
            height={350}
            donut
            arcLabelMode="percent"
            valueSuffix=" ürün"
          />
        </ChartCard>
      </Grid>

      {/* Orta satır: varyantlara göre aylık (kümülatif) GROUP BAR chart */}
      <Grid size={{ xs: 12, md: 8 }}>
        <ChartCard
          title="Varyantlara Göre Toplam Ürün Sayısı"
          timeLabel="Son 12 ay"
        >
          <GroupBarChart
            labels={variantsMonthly.labels}
            series={variantSeries.map((item) => ({
              label: item.label,
              data: item.data,
            }))}
            height={350}
            tone="soft"
          />
        </ChartCard>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ChartCard title="Varyant Dağılımı" timeLabel="Tüm ürünler">
          <PieDonutChart
            items={variants.items}
            height={350}
            donut
            arcLabelMode="percent"
            topK={variants.items.length}
            valueSuffix=" ürün"
          />
        </ChartCard>
      </Grid>
    </Grid>
  );
}
