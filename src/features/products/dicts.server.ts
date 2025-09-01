// src/features/products/dicts.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

export type ProductDicts = {
  variants: string[];
  categories: string[];
  categoryTree: Record<string, string[]>;
  maxUnitWeightKg?: number;
};

// Satır tiplerini şemadan çıkar
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type VariantRow  = Database['public']['Tables']['variants']['Row'];
type ProductRow  = Database['public']['Tables']['products']['Row'];

export async function fetchProductDicts(): Promise<ProductDicts> {

  // Server client'ı tipli al
  const sb = await createSupabaseServerClient();

  // 1) Kategoriler (boş bile olsa)
  const { data: cats, error: catErr } = await sb
    .from('categories')
    .select('id, slug, name, parent_id, is_active, sort')
    .eq('is_active', true)
    .order('sort', { ascending: true })
    .returns<Pick<CategoryRow, 'id' | 'slug' | 'name' | 'parent_id' | 'is_active' | 'sort'>[]>();

  if (catErr) throw catErr;

  const roots = (cats ?? []).filter(c => !c.parent_id);
  const subs  = (cats ?? []).filter(c =>  c.parent_id);

  const categories = roots.map(r => r.slug);
  const categoryTree: Record<string, string[]> = Object.fromEntries(
    roots.map(r => [
      r.slug,
      subs.filter(s => s.parent_id === r.id).map(s => s.slug),
    ])
  );

  // 2) Varyantlar
  const { data: vars, error: varErr } = await sb
    .from('variants')
    .select('key, name, sort')
    .order('sort', { ascending: true })
    .returns<Pick<VariantRow, 'key' | 'name' | 'sort'>[]>();

  if (varErr) throw varErr;

  const variants = (vars ?? []).map(v => v.key);

  // 3) Opsiyonel: max ağırlık
  const { data: maxRow, error: maxErr } = await sb
    .from('products')
    .select('unit_weight_kg')
    .order('unit_weight_kg', { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<Pick<ProductRow, 'unit_weight_kg'> | null>();

  if (maxErr) throw maxErr;

  const maxUnitWeightKg =
    typeof maxRow?.unit_weight_kg === 'number' ? Number(maxRow.unit_weight_kg) : 2;

  return { categories, categoryTree, variants, maxUnitWeightKg };
}
