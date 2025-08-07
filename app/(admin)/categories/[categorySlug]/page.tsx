// app/(admin)/categories/[categorySlug]/page.tsx
'use server'

import { Grid } from '@mui/material';

import SubCategoryCard from '../../_components_/ui/cards/SubCategoryCard';

import { supabase } from '../../../lib/supabase/supabaseClient';

export default async function SubCategoriesPage(ctx: { params: { categorySlug: string } }) {

  // ✅ Hataları önlemek için slug'ı değişken olarak çıkar
  const { categorySlug } = await ctx.params;

  // 1. categorySlug'e göre kategori ID'sini al
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError || !category) {
    console.error('Kategori bulunamadı:', categoryError?.message);
    return <p>Kategori bulunamadı.</p>;
  }

  // 2. Bu kategoriye ait subcategory'leri al
  const { data: subcategories, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Alt kategoriler alınamadı:', error.message);
    return <p>Alt kategoriler yüklenemedi.</p>;
  }

  return (
    <Grid container spacing={2} p={2}>
      {subcategories?.map((subcategory) => (
        <Grid key={subcategory.id} size={{ xs: 12, sm: 6, md: 3 }} >
          <SubCategoryCard
            image={subcategory.image}
            title={subcategory.title}
            description={subcategory.description}
            buttonText="Görüntüle"
            slug={subcategory.slug}
            categorySlug={categorySlug} // 👈 SubCategoryCard bileşenine geçiyoruz
          />
        </Grid>
      ))}
    </Grid>
  );
}
