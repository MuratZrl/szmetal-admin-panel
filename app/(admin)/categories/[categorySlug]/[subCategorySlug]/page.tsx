// app/(admin)/categories/[categorySlug]/[subCategorySlug]/page.tsx
'use server';

import ProductTable from '../../../_components_/ui/tables/ProductTables';

import { supabase } from '../../../../lib/supabase/supabaseClient';

export default async function ProductPage({ params }: {
  params: { categorySlug: string; subCategorySlug: string };
}) {
  const { data: subcategory, error: subError } = await supabase
    .from('sub_categories')
    .select('id')
    .eq('slug', params.subCategorySlug)
    .single();

  if (subError || !subcategory) return <p>Alt kategori bulunamadı</p>;

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('sub_category_id', subcategory.id);

  if (error) return <p>Ürünler yüklenemedi</p>;

  return (
    <ProductTable rows={products ?? []} />
  );
}
