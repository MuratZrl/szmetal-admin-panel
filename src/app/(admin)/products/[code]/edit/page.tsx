// app/(admin)/products/[code]/edit/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Box, Grid, Divider, Typography } from '@mui/material';

import { requirePageAccess } from '@/lib/supabase/auth/server';
import { fetchProductByCode } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/forms/mappers';
import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];
type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requirePageAccess('products');
  const { code } = await params;
  const row = await fetchProductByCode(code);
  return { title: row ? `${row.code} — Düzenle` : 'Ürün bulunamadı' };
}

export default async function EditProductPage({ params }: Props) {
  const { profile } = await requirePageAccess('products');
  if (!(profile.role === 'Admin' || profile.role === 'Manager')) {
    redirect('/unauthorized');
  }

  const { code } = await params;

  const [row, dicts] = await Promise.all([
    fetchProductByCode(code),
    fetchProductDicts(),
  ]);

  if (!row) notFound();

  // KANONİK ZORLAMA: /products/{code}/edit
  const canonical = `/products/${encodeURIComponent(row.code)}` as const;
  const here = `/products/${code}/edit`;
  const want = `${canonical}/edit` as `/products/${string}/edit`;
  if (here !== want) {
    redirect(want);
  }

  const initial = { id: String(row.id), ...mapRowToForm(row as ProductsRow) };

  return (
    <Box px={1} py={1}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {row.code} — Düzenle
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
