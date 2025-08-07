// app/(admin)/categories/page.tsx

'use server'

import Link from 'next/link';

import { Box, Button, Grid } from '@mui/material';

import CategoryCard from '../_components_/ui/cards/CategoryCard';

import { supabase } from '../../lib/supabase/supabaseClient';

export default async function CategoriesPage() {
  
  // Supabase üzerinden kategorileri çek
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Kategori verisi alınamadı:', error.message);
    return <p>Kategoriler yüklenemedi.</p>;
  }

  return (
    <Box p={2}>

      <Box className="flex justify-end mb-4">
        <Button
          variant="contained"
          component={Link}
          href="/categories/new"
          sx={{ backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
        >
          + Kategori Ekle
        </Button>
      </Box>

      <Grid container spacing={2}>
        {categories?.map((category) => (
          <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <CategoryCard
              image={category.image}
              title={category.title}
              description={category.description}
              buttonText="Görüntüle"
              slug={category.slug}
            />
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}
