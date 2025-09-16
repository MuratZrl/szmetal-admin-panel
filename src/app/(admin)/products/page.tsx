// app/(admin)/products/page.tsx
import { getSessionRole } from '@/lib/supabase/auth/getSessionRole.server';

import { Box, Grid, Divider } from '@mui/material';

import { ProductsSelectionProvider } from '@/features/products/selection/ProductsSelectionContext.client';
import ProductsToolbar from '@/features/products/components/ProductsToolbar.client';

// DİKKAT: Dosya ismi `Filters.client.tsx` ise import da öyle olmalı
import Filters from '@/features/products/components/Filter.client';

import ProductsGrid from '@/features/products/components/ProductsGrid.client';
import ProductsPagination from '@/features/products/components/ProductsPagination.client';

import { parseProductFilters } from '@/features/products/utils/parseProductFilters';

import { fetchFilteredProducts } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

type SP = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams: spPromise,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await spPromise;                    // ← önce çöz
  const role = await getSessionRole();

  const perms = {
    canCreate: role === 'Admin',
    canBulkDelete: role === 'Admin',
  };

  const filters = parseProductFilters(sp);       // ← promise değil, çözülmüş objeyi ver
  const page = Number(sp.page ?? 1) || 1;        // ← yine sp
  const pageSize = Number(sp.pageSize ?? PAGE_SIZE) || PAGE_SIZE;

  // Tek çağrı yeter
  const { items, pageCount } = await fetchFilteredProducts(filters, {
    page,
    pageSize,
  });

  const dicts = await fetchProductDicts();

  return (
    <Box px={1} py={1}>
      <ProductsSelectionProvider>
        <ProductsToolbar perms={perms} />
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Filters
              categoryTree={dicts.categoryTree}
              variants={dicts.variants}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <ProductsGrid products={items} />
            <ProductsPagination page={page} totalPages={pageCount} />
          </Grid>
        </Grid>
      </ProductsSelectionProvider>
    </Box>
  );
}
