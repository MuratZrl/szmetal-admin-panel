// app/(admin)/products/new/page.tsx
import { getSessionRole } from '@/lib/supabase/auth/getSessionRole.server';
import { redirect } from 'next/navigation';

import { Box, Grid, Divider, Typography } from '@mui/material';

import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductCreateForm from '@/features/products/components/ProductCreateForm.client';

export const dynamic = 'force-dynamic';

export default async function ProductCreatePage() {
  // yetkiyi önce kontrol et, boşuna sözlük çekme
  const role = await getSessionRole();
  if (role !== 'Admin' && role !== 'Manager') redirect('/unauthorized');

  const dicts = await fetchProductDicts();

  return (
    <Box px={1} py={1} >
      
      <Typography variant="h5" sx={{ mb: 1 }}>
        Yeni Profil Ekle
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container>
        <Grid size={{ xs: 12 }}>
          <ProductCreateForm dicts={dicts} />
        </Grid>
      </Grid>

    </Box>
  );
}
