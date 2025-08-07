// app/(admin)/categories/[categorySlug]/[subCategorySlug]/page.tsx

'use server';

import { DataGrid } from '@mui/x-data-grid';

import { productColumns } from '../../../_constants_/categories/columns';

import { supabase } from '../../../../lib/supabase/supabaseClient';

export default async function ProductPage({
  params,
}: {
  params: { categorySlug: string; subCategorySlug: string };
}) {
  // subCategory'yi slug üzerinden bul
  const { data: subcategory, error: subError } = await supabase
    .from('sub_categories')
    .select('id')
    .eq('slug', params.subCategorySlug)
    .single();

  if (subError || !subcategory) {
    return <p>Alt kategori bulunamadı</p>;
  }

  // Ürünleri al
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('sub_category_id', subcategory.id);

  if (error) {
    return <p>Ürünler yüklenemedi</p>;
  }

  return (
    <div style={{ height: 600, width: '100%', padding: '16px' }}>
      <DataGrid rows={products ?? []} columns={productColumns} getRowId={(row) => row.id} />
    </div>
  );
}
