// app/(admin)/products/page.tsx
import { Box, Grid, Divider, Typography } from '@mui/material';
import Filters from '@/features/products/components/Filter.client';
import ProductsGrid from '@/features/products/components/ProductsGrid.client';
import { fetchFilteredProducts } from '@/features/products/services/products.server';
import type { ProductFilters } from '@/features/products/types';

export const dynamic = 'force-dynamic';

const arrParam = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : (typeof v === 'string' ? [v] : []);

export default async function ProductsPage(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  // SADECE burası: Promise'i await et
  const sp = await props.searchParams;

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

  const products = await fetchFilteredProducts(filters) ?? [];

  return (
    <Box px={2} py={2}>
      <Typography variant="h5" sx={{ mb: 1 }}>Ürünler</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Filters />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <ProductsGrid products={products} />
        </Grid>
      </Grid>
    </Box>
  );
}
