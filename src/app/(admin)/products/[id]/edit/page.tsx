// app/(admin)/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Box, Grid, Divider, Typography } from '@mui/material';
import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/forms/mappers';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;                 // ← await şart
  const product = await fetchProductById(id);
  return { title: product ? `${product.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;                 // ← burada da await

  const [product, dicts] = await Promise.all([
    fetchProductById(id), 
    fetchProductDicts(),
  ]);

  if (!product) notFound();

  const initial = { id: String(product.id), ...mapRowToForm(product) };

  return (
    <Box px={2} py={2}>
      <Typography variant="h5" sx={{ mb: 1 }}>{product.code} — Düzenle</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ProductEditForm dicts={dicts} initial={initial} />
        </Grid>
      </Grid>
    </Box>
  );
}
