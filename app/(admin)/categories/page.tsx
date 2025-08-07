'use server';

import { createSupabaseServerClient } from '../../lib/supabase/supabaseServer';

import { List, ListItemButton, ListItemText, Typography, Grid, Card, CardContent } from '@mui/material';

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();

  // 1. Kategorileri çek
  const { data: categories } = await supabase.from('categories').select('id, name');

  if (!categories || categories.length === 0) {
    return <p>Kategori bulunamadı.</p>;
  }

  // 2. İlk kategoriye ait sub_category'leri çek
  const selectedCategory = categories[0];
  const { data: subCategories } = await supabase
    .from('sub_categories')
    .select('id, name, image_url')
    .eq('category_id', selectedCategory.id);

  return (
    <Grid container spacing={4} padding={4} >

      {/* Sol Panel */}
      <Grid size={{ xs: 12, sm: 4, md: 3 }} >

        <Typography variant="h6" gutterBottom>Kategoriler</Typography>
        <List>
          {categories.map((cat) => (
            <ListItemButton key={cat.id} >
              <ListItemText primary={cat.name} />
            </ListItemButton>
          ))}
        </List>

      </Grid>

      {/* Sağ Panel */}
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
        
        <Grid container spacing={2}>
          {subCategories?.map((sc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sc.id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{sc.name}</Typography>
                <Typography variant="body2" color="text.secondary">Açıklama eklenebilir</Typography>
              </CardContent>
            </Grid>
          ))}
        </Grid>

      </Card>
    </Grid>
  );
}
