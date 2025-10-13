// app/(admin)/products/[profileCode]/edit/page.tsx
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Box, Grid, Divider, Typography } from '@mui/material';

import { requirePageAccess } from '@/lib/supabase/auth/server';
import { fetchProductByKey } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/forms/mappers';
import { productCanonicalPath } from '@/features/products/utils/url'; // ← EKLENDİ
import type { Database } from '@/types/supabase';
type ProductsRow = Database['public']['Tables']['products']['Row'];

type Props = { params: Promise<{ profileCode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requirePageAccess('products');
  const { profileCode } = await params;
  const row = await fetchProductByKey(profileCode);
  return { title: row ? `${row.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: Props) {
  const { profile } = await requirePageAccess('products');
  if (!(profile.role === 'Admin' || profile.role === 'Manager')) {
    redirect('/unauthorized');
  }

  const { profileCode } = await params;

  const [row, dicts] = await Promise.all([
    fetchProductByKey(profileCode),
    fetchProductDicts(),
  ]);

  if (!row) notFound();

  // ←←← KANONİK ZORLAMA
  const canonical = productCanonicalPath(row as ProductsRow); // `/products/${string}`
  
  const here = `/products/${profileCode}/edit`;
  const want = `${canonical}/edit`;
  
  if (here !== want) {
    redirect(want as never);
  }

  const initial = { id: String(row.id), ...mapRowToForm(row) };

  return (
    <Box px={1} py={1}>
      <Typography variant="h5" sx={{ mb: 1 }}>{row.code} — Düzenle</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ProductEditForm dicts={dicts} initial={initial} />
        </Grid>
      </Grid>
    </Box>
  );
}
