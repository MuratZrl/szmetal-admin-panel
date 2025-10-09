// app/(admin)/products/[id]/edit/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Box, Grid, Divider, Typography } from '@mui/material';
import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/forms/mappers';

// Projendeki mevcut pattern'i bozmayayım diye Promise'lı params'ı korudum.
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  return { title: product ? `${product.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, dicts] = await Promise.all([
    fetchProductById(id),
    fetchProductDicts(),
  ]);

  if (!product) notFound();

  const initial = { id: String(product.id), ...mapRowToForm(product) };

  return (
    <Box px={1} py={1}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {product.code} — Düzenle
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ProductEditForm dicts={dicts} initial={initial} />
        </Grid>
      </Grid>
    </Box>
  );
}
