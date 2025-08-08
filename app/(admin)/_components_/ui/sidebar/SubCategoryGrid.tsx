'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';
import { supabase } from '../../../../lib/supabase/supabaseClient';
import { Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';

type Product = {
  id: string;
  name: string;
  image_url?: string;
};

export default function SubCategoryGrid() {
  const selectedSubCategoryId = useCategoryStore((s) => s.selectedSubCategoryId);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!selectedSubCategoryId) return;

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url')
        .eq('sub_category_id', selectedSubCategoryId);

      if (!error && data) setProducts(data);
    };

    fetchProducts();
  }, [selectedSubCategoryId]);

  if (!selectedSubCategoryId) {
    return <Typography>Lütfen bir alt kategori seçin.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {products.map((p) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
          <Card>
            {p.image_url && (
              <CardMedia
                component="img"
                height="160"
                image={p.image_url}
                alt={p.name}
              />
            )}
            <CardContent>
              <Typography variant="h6">{p.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
