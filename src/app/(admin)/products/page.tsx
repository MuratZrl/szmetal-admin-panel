// app/(admin)/products/page.tsx
import { Box, Grid, Divider } from '@mui/material';

import { ProductsSelectionProvider } from '@/features/products/selection/ProductsSelectionContext.client';
import ProductsToolbar from '@/features/products/components/ProductsToolbar.client';

import Filters from '@/features/products/components/Filter.client';
import ProductsGrid from '@/features/products/components/ProductsGrid.client';
import ProductsPagination from '@/features/products/components/ProductsPagination.client';
import { fetchFilteredProducts } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/dicts.server';
import type { ProductFilters } from '@/features/products/types';

export const dynamic = 'force-dynamic';

function arrParam(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : (typeof v === 'string' ? [v] : []);
}

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  // Next 15 doğru: Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams;

  const filters: ProductFilters = {
    q: typeof sp.q === 'string' ? sp.q : undefined,
    categories: arrParam(sp.category),
    subCategories: arrParam(sp.subCategory),
    variants: arrParam(sp.variants),
    wMin: typeof sp.wMin === 'string' ? Number(sp.wMin) : undefined,
    wMax: typeof sp.wMax === 'string' ? Number(sp.wMax) : undefined,
    from: typeof sp.from === 'string' ? sp.from : undefined,
    to: typeof sp.to === 'string' ? sp.to : undefined,
    sort: typeof sp.sort === 'string' ? (sp.sort as ProductFilters['sort']) : 'date-desc',
  };

  const page = typeof sp.page === 'string' ? Math.max(1, Number(sp.page) || 1) : 1;

  // Sözlükleri çek
  const dicts = await fetchProductDicts();

  const { items, pageCount } = await fetchFilteredProducts(filters, { page, pageSize: PAGE_SIZE });

  return (
    <Box px={2} py={2} >
      <ProductsSelectionProvider>

        <ProductsToolbar />
        
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Filters
              categoryTree={dicts.categoryTree}
              variants={dicts.variants}
              maxUnitWeightKg={dicts.maxUnitWeightKg}
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
