// src/features/products/api/fetchTaxonomies.ts
import { supabase } from '@/lib/supabase/supabaseClient';

export type Category = { id: string; slug: string; name: string; parent_id: string | null; sort: number };
export type Variant = { key: string; name: string; sort: number };

export async function fetchTaxonomies() {
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id, sort')
    .eq('is_active', true)
    .order('sort', { ascending: true });

  if (catErr) throw catErr;

  const { data: vars, error: varErr } = await supabase
    .from('variants')
    .select('key, name, sort')
    .order('sort', { ascending: true });

  if (varErr) throw varErr;

  // Kök kategoriler ve alt kategoriler
  const roots = (cats ?? []).filter(c => !c.parent_id);
  const subs  = (cats ?? []).filter(c => c.parent_id);

  // Formun bugün istediği gibi "string listeler" gerekiyorsa:
  const categories = roots.map(r => r.slug); // value olarak slug kullanmak daha güvenli
  const categoryTree: Record<string, string[]> = {};
  for (const r of roots) {
    categoryTree[r.slug] = subs
      .filter(s => s.parent_id === r.id)
      .map(s => s.slug);
  }

  const variants = (vars ?? []).map(v => v.key);

  return { categories, variants, categoryTree, cats: cats ?? [], vars: vars ?? [] };
}
