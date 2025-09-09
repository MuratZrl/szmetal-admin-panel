// app/(admin)/products/new/page.tsx
import { Box, Divider, Typography, Grid } from '@mui/material';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductForm from '@/features/products/components/ProductForm.client';

export const dynamic = 'force-dynamic';

export default async function ProductCreatePage() {
  const dicts = await fetchProductDicts();

  return (
    <Box px={2} py={2}>

      <Typography variant="h5" sx={{ mb: 1 }}>
        Yeni Ürün Oluştur
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container >

        <Grid size={{ xs: 12, md: 8 }}>

          <ProductForm dicts={dicts} />

        </Grid>

      </Grid>
      
    </Box>
  );
}
