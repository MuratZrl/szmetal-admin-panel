// src/app/(admin)/products_analytics/page.tsx
import { Box } from '@mui/material';

import CardsGrid from '@/features/products_analytics/components/CardsGrid';
import ChartsSection from '@/features/products_analytics/components/ChartsSection';
import ProductsDataGrid from '@/features/products_analytics/components/datagrid/ProductsDataGrid.client';

import { getProductAnalyticsRows } from '@/features/products_analytics/services/table.server';

export default async function ProductsAnalyticsPage() {
  const rows = await getProductAnalyticsRows();

  return (
    <Box
      component="main"
      sx={{
        px: { xs: 2, sm: 3, md: 1 },
        py: { xs: 2, sm: 3, md: 2 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* En üstte Stat kartları */}
      <CardsGrid />

      {/* Ortada grafikler */}
      <ChartsSection />

      {/* En altta DataGrid */}
      <ProductsDataGrid rows={rows} />

    </Box>
  );
}
