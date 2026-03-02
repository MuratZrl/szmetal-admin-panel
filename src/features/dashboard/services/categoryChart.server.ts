// src/features/dashboard/services/categoryChart.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type CategoryPieItem = { label: string; value: number };
export type CategoryPieData = { items: CategoryPieItem[] };

export async function fetchCategoryDistribution(): Promise<CategoryPieData> {
  const supabase = await createSupabaseServerClient();

  // category_stats view: parent_id, product_count
  const { data: stats } = await supabase
    .from('category_stats')
    .select('parent_id, product_count');

  // Resolve parent category names
  const parentIds = (stats ?? [])
    .map((s) => s.parent_id)
    .filter(Boolean) as string[];

  const nameMap = new Map<string, string>();

  if (parentIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', parentIds);

    for (const c of cats ?? []) {
      nameMap.set(c.id, c.name);
    }
  }

  const all: CategoryPieItem[] = (stats ?? [])
    .filter((s) => s.product_count && s.product_count > 0)
    .map((s) => ({
      label: (s.parent_id ? nameMap.get(s.parent_id) : null) ?? 'Diğer',
      value: s.product_count ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Keep top 7, merge the rest into "Diğer"
  const items: CategoryPieItem[] = all.slice(0, 7);
  const rest = all.slice(7);
  if (rest.length > 0) {
    const otherTotal = rest.reduce((sum, r) => sum + r.value, 0);
    const existing = items.find(i => i.label === 'Diğer');
    if (existing) {
      existing.value += otherTotal;
    } else {
      items.push({ label: 'Diğer', value: otherTotal });
    }
  }

  return { items };
}

// --------------- Date-range variant ---------------
import type { DateRange } from '../types/dashboardData';

type ProductRow = { created_at: string; category_id: string | null };
type CatRow = { id: string; name: string; parent_id: string | null };

export async function fetchCategoryForRange(range: DateRange): Promise<CategoryPieData> {
  const supabase = await createSupabaseServerClient();

  // Get products within the date range
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('created_at, category_id')
    .gte('created_at', range.startISO)
    .lt('created_at', range.endISO) as { data: ProductRow[] | null; error: unknown };
  if (prodErr) throw prodErr;

  if (!products?.length) return { items: [] };

  // Count by category_id
  const countByCat = new Map<string, number>();
  for (const p of products) {
    const catId = p.category_id ?? 'unknown';
    countByCat.set(catId, (countByCat.get(catId) ?? 0) + 1);
  }

  // Resolve category names (get parents for subcategories)
  const catIds = Array.from(countByCat.keys()).filter(id => id !== 'unknown');
  const nameMap = new Map<string, string>();

  if (catIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .in('id', catIds) as { data: CatRow[] | null; error: unknown };

    // Get parent IDs for subcategories
    const parentIds = (cats ?? []).map(c => c.parent_id).filter(Boolean) as string[];
    const parentNameMap = new Map<string, string>();

    if (parentIds.length > 0) {
      const { data: parents } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', parentIds);
      for (const p of parents ?? []) parentNameMap.set(p.id, p.name);
    }

    // Use parent name if subcategory, otherwise own name
    for (const c of cats ?? []) {
      const name = c.parent_id ? (parentNameMap.get(c.parent_id) ?? c.name) : c.name;
      nameMap.set(c.id, name);
    }
  }

  // Aggregate by parent category name
  const byParent = new Map<string, number>();
  for (const [catId, count] of countByCat) {
    const name = nameMap.get(catId) ?? 'Diğer';
    byParent.set(name, (byParent.get(name) ?? 0) + count);
  }

  const all: CategoryPieItem[] = Array.from(byParent.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Keep top 7, merge the rest into "Diğer"
  const items: CategoryPieItem[] = all.slice(0, 7);
  const rest = all.slice(7);
  if (rest.length > 0) {
    const otherTotal = rest.reduce((sum, r) => sum + r.value, 0);
    const existing = items.find(i => i.label === 'Diğer');
    if (existing) {
      existing.value += otherTotal;
    } else {
      items.push({ label: 'Diğer', value: otherTotal });
    }
  }

  return { items };
}
