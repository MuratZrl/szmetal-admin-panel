// app/(admin)/products/new/page.tsx
import { redirect } from 'next/navigation';
import { Box, Grid } from '@mui/material';

import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductCreateForm from '@/features/products/components/form/ProductCreateForm.client';
import { requirePageAccess } from '@/lib/supabase/auth/guards.server';

export const dynamic = 'force-dynamic';

export default async function ProductCreatePage() {
  const { profile } = await requirePageAccess('/products');

  if (profile.role !== 'Admin' && profile.role !== 'Manager') {
    redirect('/unauthorized?reason=role');
  }

  const dicts = await fetchProductDicts();

  return (
    <Box px={1} py={1} >
      <Grid container >
        <Grid size={{ xs: 12 }} >
          <ProductCreateForm dicts={dicts} title="Yeni Profil Ekle" />
        </Grid>
      </Grid>
    </Box>
  );
}
