'use client';

import { useEffect, useState } from 'react';
import { useCategoryStore } from '../../../../lib/stores/categoryStore';
import { Grid, Typography } from '@mui/material';
import TopBar from './TopBar';
import ProductCard from '../cards/ProductCard';
import CustomPagination from '../pagination/Pagination';
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

  const [page, setPage] = useState(1);
  const [perPage] = useState(12); // sayfa başına ürün sayısı

  const selectedSubCategoryIds = useCategoryStore((s) => s.selectedSubCategoryIds);
  const selectedProperties = useCategoryStore((s) => s.selectedProperties);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select('id, name, image_url, description, property, created_at', { count: 'exact' });

      if (selectedSubCategoryIds.length > 0) {
        query = query.in('sub_category_id', selectedSubCategoryIds);
      }

      if (selectedProperties.length > 0) {
        query = query.in('property', selectedProperties);
      }

      query = query
        .order('created_at', { ascending: sortOrder === 'oldest' })
        .range((page - 1) * perPage, page * perPage - 1); // ✅ sayfalama

      const { data, error, count } = await query;

      if (!error && data) {
        setProducts(data);
        setTotalProducts(count || 0);
      }
    };

    fetchProducts();
  }, [selectedSubCategoryIds, selectedProperties, sortOrder, page, perPage]);

  const totalPages = Math.ceil(totalProducts / perPage);

  return (
    <>
      {/* Üst bar */}
      <TopBar
        totalProducts={totalProducts}
        sortOrder={sortOrder}
        onSortChange={(val) => setSortOrder(val)}
      />

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
                property={p.property}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          onChange={(_, value) => setPage(value)}
        />
      )}
    </>
  );
}
