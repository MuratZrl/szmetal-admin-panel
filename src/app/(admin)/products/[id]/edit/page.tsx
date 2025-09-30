// app/(admin)/products/[id]/edit/page.tsx
import { createServerClient } from '@supabase/ssr';

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { redirect } from 'next/navigation';

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

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {}, remove() {},
      }
    }
  );

  const [product, dicts] = await Promise.all([
    fetchProductById(id), 
    fetchProductDicts(),
  ]);

  if (!product) notFound();

  const initial = { id: String(product.id), ...mapRowToForm(product) };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!data || data.role !== 'Admin') {
    redirect('/unauthorized');
  }

  return (
    <Box px={1} py={1}>
      
      <Typography variant="h5" sx={{ mb: 1 }}>{product.code} — Düzenle</Typography>
      
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>

        <Grid size={{ xs: 12, md: 12 }}>
          <ProductEditForm dicts={dicts} initial={initial} />
        </Grid>
        
      </Grid>
    
    </Box>
  );
}
