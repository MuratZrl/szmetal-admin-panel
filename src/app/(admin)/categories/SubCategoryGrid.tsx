'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ yönlendirme için
import { useCategoryStore } from '../../../lib/stores/categoryStore';

import { Container, Box, Grid, Typography } from '@mui/material';

import TopBar from './TopBar';
import ProductCard from '../../../components/ui/cards/ProductCard';
import CustomPagination from '../../../components/ui/pagination/Pagination';

import { supabase } from '../../../lib/supabase/supabaseClient';

type Product = {
  id: string;
  name: string;
  image_url?: string;
  kg_per_m?: number;
  created_at?: string;
  property?: string;
  is_active?: boolean;
};

export default function SubCategoryGrid() {
  const router = useRouter(); // ✅ yönlendirme hook'u

  const [page, setPage] = useState(1);
  const [perPage] = useState(12); // sayfa başına ürün sayısı

  const selectedSubCategoryIds = useCategoryStore((s) => s.selectedSubCategoryIds);
  const selectedProperties = useCategoryStore((s) => s.selectedProperties);
  const kgPerMRange = useCategoryStore((s) => s.kgPerMRange);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const searchTerm = useCategoryStore((s) => s.searchTerm);

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase
      .from('products')
      .select(
        'id, name, image_url, kg_per_m, property, created_at, is_active', // ✅ is_active eklendi
        { count: 'exact' }
      );

      if (selectedSubCategoryIds.length > 0) {
        query = query.in('sub_category_id', selectedSubCategoryIds);
      }

      if (selectedProperties.length > 0) {
        query = query.in('property', selectedProperties);
      }

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (kgPerMRange) {
        query = query.gte('kg_per_m', kgPerMRange[0]).lte('kg_per_m', kgPerMRange[1]);
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
  }, [selectedSubCategoryIds, selectedProperties, searchTerm, kgPerMRange, sortOrder, page, perPage]);

  const totalPages = Math.ceil(totalProducts / perPage);

  return (
    <Container maxWidth="xl" >

      {/* Üst bar */}
      <TopBar
        totalProducts={totalProducts}
        sortOrder={sortOrder}
        onSortChange={(val) => setSortOrder(val)}
      />

      {/* Ürünler grid */}
      <Grid container spacing={{ xs: 2, sm: 2 }} >
        {products.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Typography align="center">Ürün bulunamadı.</Typography>
          </Grid>
        ) : (
          products.map((p) => (
            <Grid size={{ xs: 12, sm: 4, md: 3 }} key={p.id}>
              <ProductCard
                id={p.id}
                name={p.name}
                image_url={p.image_url}
                kg_per_m={p.kg_per_m}
                property={p.property}
                created_at={p.created_at}
                is_active={p.is_active}
                onEdit={(id) => router.push(`/categories/${id}`)} // ✅ yönlendirme çalışır
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CustomPagination
            page={page}
            totalPages={totalPages}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}

    </Container>
  );
}
