// src/features/products/dicts.server.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

// UI'nin beklediği ağaç
export type CategoryTree = Record<
  string, // parent slug
  { name: string; subs: { slug: string; name: string }[] }
>;

export type VariantOption = { key: string; name: string };

// Döndürülecek sözlük tipi (UI tarafında kullanacağın şekil)
// Slider yok: maxUnitWeightKg kaldırıldı.
export type ProductDicts = {
  variants: VariantOption[];
  categories: string[];       // sadece root slug listesi (opsiyonel kullanım)
  categoryTree: CategoryTree; // isimli ağaç
};

// Satır tiplerini şemadan çıkar
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type VariantRow  = Database['public']['Tables']['variants']['Row'];

function buildCategoryTree(
  rows: readonly Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]
): { categories: string[]; categoryTree: CategoryTree } {
  const ok = rows.filter(r => r.is_active !== false && !!r.slug && !!r.name);

  const byId   = new Map(ok.map(r => [r.id, r]));
  const roots  = ok.filter(r => !r.parent_id);
  const childs = ok.filter(r => !!r.parent_id);

  const categories = roots.map(r => r.slug);

  const categoryTree: CategoryTree = Object.fromEntries(
    roots.map(r => [r.slug, { name: r.name, subs: [] }])
  );

  for (const c of childs) {
    const p = c.parent_id ? byId.get(c.parent_id) : undefined;
    if (p && categoryTree[p.slug]) {
      categoryTree[p.slug].subs.push({ slug: c.slug, name: c.name });
    }
  }

  // Altları alfabetik sırala (TR yerelleştirmesiyle)
  for (const node of Object.values(categoryTree)) {
    node.subs.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  return { categories, categoryTree };
}

export async function fetchProductDicts(): Promise<ProductDicts> {
  const sb = await createSupabaseServerClient();

  // 1) Kategoriler
  const { data: cats, error: catErr } = await sb
    .from('categories')
    .select('id, slug, name, parent_id, is_active, sort')
    .eq('is_active', true)
    .order('sort', { ascending: true })
    .order('name', { ascending: true })
    .returns<Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]>();

  if (catErr) throw catErr;

  const { categories, categoryTree } = buildCategoryTree(cats ?? []);

  // 2) Varyantlar
  const { data: vars, error: varErr } = await sb
    .from('variants')
    .select('key, name, sort')
    .order('sort', { ascending: true })
    .returns<Pick<VariantRow, 'key' | 'name' | 'sort'>[]>();

  if (varErr) throw varErr;

  const variants: VariantOption[] = (vars ?? []).map(v => ({ key: v.key, name: v.name }));

  return { categories, categoryTree, variants };
}
