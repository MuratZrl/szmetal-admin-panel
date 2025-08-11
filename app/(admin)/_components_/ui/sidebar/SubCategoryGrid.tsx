'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';
import { Grid, Typography, FormControl, Select, MenuItem, Box } from '@mui/material';
import ProductCard from '../cards/ProductCard';
import { supabase } from '../../../../lib/supabase/supabaseClient';

type Product = {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  created_at?: string;
  property?: string;
};

export default function SubCategoryGrid() {
  const selectedSubCategoryIds = useCategoryStore((s) => s.selectedSubCategoryIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select('id, name, image_url, description, property, created_at');

      // Filtre varsa uygula
      if (selectedSubCategoryIds && selectedSubCategoryIds.length > 0) {
        query = query.in('sub_category_id', selectedSubCategoryIds);
      }

      // Sıralama ekle
      if (sortOrder === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
    };

    fetchProducts();
  }, [selectedSubCategoryIds, sortOrder]);

  return (
    <>
      {/* Üst bar */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2} gap={1}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Sırala:
        </Typography>
        <FormControl size="small">
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          >
            <MenuItem value="newest">En Yeni</MenuItem>
            <MenuItem value="oldest">En Eski</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Ürünler grid */}
      <Grid container spacing={2}>
        {products.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Typography>Ürün bulunamadı.</Typography>
          </Grid>
        ) : (
          products.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.id}>
              <ProductCard
                id={p.id}
                name={p.name}
                image_url={p.image_url}
                description={p.description}
                property={p.property} // Supabase'ten gelen property sütunu
              />
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
}
