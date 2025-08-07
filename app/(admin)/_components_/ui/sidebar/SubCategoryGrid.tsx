'use client';

import { useEffect, useState } from 'react';

import { useCategoryStore } from '../../../../lib/stores/categoryStore';

import { supabase } from '../../../../lib/supabase/supabaseClient';

import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
} from '@mui/material';

type SubCategory = {
  id: string;
  name: string;
  image_url?: string;
};

export default function SubCategoryGrid() {
  const selectedCategoryId = useCategoryStore((s) => s.selectedCategoryId);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const fetchSubCategories = async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('id, name, image_url')
        .eq('category_id', selectedCategoryId);

      if (!error && data) setSubCategories(data);
    };

    fetchSubCategories();
  }, [selectedCategoryId]);

  if (!selectedCategoryId) {
    return <Typography>Lütfen bir kategori seçin.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {subCategories.map((sc) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sc.id}>
          <Card>
            {sc.image_url && (
              <CardMedia
                component="img"
                height="160"
                image={sc.image_url}
                alt={sc.name}
              />
            )}
            <CardContent>
              <Typography variant="h6">{sc.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
