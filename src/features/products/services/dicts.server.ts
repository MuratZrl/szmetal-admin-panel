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

// dicts.server.ts içindeki buildCategoryTree'yi bununla değiştir
function buildCategoryTree(
  rows: readonly Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]
): { categories: string[]; categoryTree: CategoryTree } {
  const ok = rows.filter(r => r.is_active !== false && !!r.slug && !!r.name);

  const collator = new Intl.Collator('tr', { sensitivity: 'base' });
  const byOrder = (a: typeof ok[number], b: typeof ok[number]) =>
    (a.sort ?? 0) - (b.sort ?? 0) || collator.compare(a.name, b.name);

  const roots = ok.filter(r => !r.parent_id).sort(byOrder);
  const categories = roots.map(r => r.slug); // yalnızca kök slug listesi (UI isterse kullanır)

  // parent_id -> children
  const childrenMap = new Map<string | null, typeof ok>();
  for (const r of ok) {
    const key = r.parent_id ?? null;
    const arr = childrenMap.get(key);
    if (arr) arr.push(r);
    else childrenMap.set(key, [r]);
  }

  // HER kategori bir anahtar; subs sadece kendi çocukları
  const categoryTree: CategoryTree = {};
  for (const r of ok) {
    const kids = (childrenMap.get(r.id) ?? []).slice().sort(byOrder);
    categoryTree[r.slug] = {
      name: r.name,
      subs: kids.map(k => ({ slug: k.slug, name: k.name })),
    };
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
