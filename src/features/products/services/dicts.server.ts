// src/features/products/dicts.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

// UI'nin beklediği ağaç
export type CategoryTree = Record<
  string, // parent slug
  { name: string; subs: { slug: string; name: string }[] }
>;

export type VariantOption = { key: string; name: string };

// Döndürülecek sözlük tipi (UI tarafında kullanacağın şekil)
export type ProductDicts = {
  variants: VariantOption[];        // ← string[] değil
  categories: string[];          // sadece root slug listesi (isteğe bağlı)
  categoryTree: CategoryTree;    // ← ARTIK isimli ağaç
  maxUnitWeightKg: number;       // slider için kg
};

// Satır tiplerini şemadan çıkar
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type VariantRow  = Database['public']['Tables']['variants']['Row'];
type ProductRow  = Database['public']['Tables']['products']['Row'];

function buildCategoryTree(rows: readonly Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]): {
  categories: string[];
  categoryTree: CategoryTree;
} {
  // Geçerli satırlar
  const ok = rows.filter(r => r.is_active !== false && !!r.slug && !!r.name);

  const byId = new Map(ok.map(r => [r.id, r]));
  const roots = ok.filter(r => !r.parent_id);
  const childs = ok.filter(r => !!r.parent_id);

  const categories = roots.map(r => r.slug);

  const categoryTree: CategoryTree = Object.fromEntries(
    roots.map(r => [r.slug, { name: r.name, subs: [] }])
  );

  // Altları ebeveynlerine bağla
  for (const c of childs) {
    const p = c.parent_id ? byId.get(c.parent_id) : undefined;
    if (p && categoryTree[p.slug]) {
      categoryTree[p.slug].subs.push({ slug: c.slug, name: c.name });
    }
  }

  // İsteğe bağlı: alfabetik veya sort'a göre altları sırala
  for (const node of Object.values(categoryTree)) {
    node.subs.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  return { categories, categoryTree };
}

export async function fetchProductDicts(): Promise<ProductDicts> {

  // Server client'ı tipli al
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

  const variants: VariantOption[] = (vars ?? []).map(v => ({
    key: v.key,
    name: v.name,
  }));

  // 3) Maks ağırlık (g/m → kg/m)
  const { data: maxRow, error: maxErr } = await sb
    .from('products')
    .select('unit_weight_g_pm')
    .order('unit_weight_g_pm', { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<Pick<ProductRow, 'unit_weight_g_pm'> | null>();

  if (maxErr) throw maxErr;

  // kg'ye çevir, en az 2 kg olsun, 1 ondalığa yuvarla
  const rawKg = typeof maxRow?.unit_weight_g_pm === 'number'
    ? maxRow.unit_weight_g_pm / 1000
    : 2;

  const maxUnitWeightKg = Math.max(10, Math.round(rawKg * 10) / 10);

  return { categories, categoryTree, variants, maxUnitWeightKg };
}
