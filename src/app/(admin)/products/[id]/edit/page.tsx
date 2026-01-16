// app/(admin)/products/[id]/edit/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { Box, Grid } from '@mui/material';
import { notFound, redirect } from 'next/navigation';

import { requirePageAccess } from '@/lib/supabase/auth/guards.server';
import { createSupabaseRSCClient } from '@/lib/supabase/supabaseServer';

import { fetchProductById } from '@/features/products/services/products.server';
import { fetchProductDicts } from '@/features/products/services/dicts.server';
import ProductEditForm from '@/features/products/components/form/ProductEditForm.client';
import { mapRowToForm } from '@/features/products/components/form/forms/mappers';

import type { Database } from '@/types/supabase';

type ProductsRow = Database['public']['Tables']['products']['Row'];
type Props = { params: Promise<{ id: string }> };

type CategoryMini = Pick<
  Database['public']['Tables']['categories']['Row'],
  'id' | 'slug' | 'parent_id'
>;

async function fetchCategoryMini(categoryId: string): Promise<CategoryMini | null> {
  const supabase = await createSupabaseRSCClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, parent_id')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function resolveCategoryCascadeSlugs(
  leafCategoryId: string | null,
): Promise<{ category: string; subCategory: string; subSubCategory: string }> {
  if (!leafCategoryId) return { category: '', subCategory: '', subSubCategory: '' };

  const leaf = await fetchCategoryMini(leafCategoryId);
  if (!leaf) return { category: '', subCategory: '', subSubCategory: '' };

  // 1 seviye: leaf zaten root
  if (!leaf.parent_id) {
    return { category: leaf.slug, subCategory: '', subSubCategory: '' };
  }

  const parent = await fetchCategoryMini(String(leaf.parent_id));
  if (!parent) {
    // Parent okunamazsa en azından leaf’i category gibi döndür (UI’da bir şey görünsün)
    return { category: leaf.slug, subCategory: '', subSubCategory: '' };
  }

  // 2 seviye: root = parent, alt = leaf
  if (!parent.parent_id) {
    return { category: parent.slug, subCategory: leaf.slug, subSubCategory: '' };
  }

  // 3 seviye: root = grand, alt = parent, en alt = leaf
  const root = await fetchCategoryMini(String(parent.parent_id));
  return {
    category: root?.slug ?? parent.slug,
    subCategory: parent.slug,
    subSubCategory: leaf.slug,
  };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const { profile } = await requirePageAccess(`/products/${encodeURIComponent(id)}/edit`);
  if (profile.role !== 'Admin' && profile.role !== 'Manager') {
    redirect('/unauthorized?reason=role');
  }

  const [row, dicts] = await Promise.all([fetchProductById(id), fetchProductDicts()]);
  if (!row) notFound();

  const leafCategoryId = row.category_id ? String(row.category_id) : null;
  const cascade = await resolveCategoryCascadeSlugs(leafCategoryId);

  const baseInitial = { id: String(row.id), ...mapRowToForm(row as ProductsRow) };

  // Kategori alanlarını DB’deki category_id’den türeterek dolduruyoruz.
  // Böylece edit ekranında “Seçiniz” değil, gerçek seçimler görünür.
  const initial = {
    ...baseInitial,
    category: cascade.category,
    subCategory: cascade.subCategory,
    subSubCategory: cascade.subSubCategory,
  };

  return (
    <Box px={1} py={1}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ProductEditForm dicts={dicts} initial={initial} title={`${row.code} — Düzenle`} />
        </Grid>
      </Grid>
    </Box>
  );
}
