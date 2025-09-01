// app/(admin)/products/new/page.tsx
import { Box, Divider, Typography, Paper } from '@mui/material';
import { fetchProductDicts } from '@/features/products/dicts.server';
import ProductForm from '@/features/products/components/ProductForm.client';

export const dynamic = 'force-dynamic';

export default async function ProductCreatePage() {
  const dicts = await fetchProductDicts();

  return (
    <Box px={2} py={2}>

      <Typography variant="h5" sx={{ mb: 1 }}>Yeni Ürün</Typography>

      <Divider sx={{ mb: 2 }} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <ProductForm dicts={dicts} />
      </Paper>
      
    </Box>
  );
}
