// app/(admin)/products/[id]/edit/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { Box, Grid } from '@mui/material';
import { notFound, redirect } from 'next/navigation';

import { requirePageAccess } from '@/lib/supabase/auth/guards.server';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/form/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/forms/mappers';

import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];
type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const { profile } = await requirePageAccess(`/products/${encodeURIComponent(id)}/edit`);
  if (profile.role !== 'Admin' && profile.role !== 'Manager') {
    redirect('/unauthorized?reason=role');
  }

  const [row, dicts] = await Promise.all([fetchProductById(id), fetchProductDicts()]);
  if (!row) notFound();

  const initial = { id: String(row.id), ...mapRowToForm(row as ProductsRow) };

  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ProductEditForm dicts={dicts} initial={initial} title={`${row.code} — Düzenle`} />
        </Grid>
      </Grid>
    </Box>
  );
}
