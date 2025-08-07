'use server'

import { Grid } from '@mui/material';

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
    <Grid container spacing={2} p={2} >
      {categories?.map((category) => (
        <Grid key={category.id} size={{ xs: 12, sm: 6, md: 3 }} >
          <CategoryCard
            image={category.image}
            title={category.title}
            description={category.description}
            buttonText="Görüntüle"
            slug={category.slug} // 👈 Yeni ekledik
          />
        </Grid>
      ))}
    </Grid>
  );
}
