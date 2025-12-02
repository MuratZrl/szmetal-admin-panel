// src/features/products_analytics/services/charts.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';

export type MonthlyProductsSeries = {
  labels: string[];
  /** Tüm ürünler (kümülatif toplam) */
  all: number[];
  /** has_customer_mold = true (kümülatif toplam) */
  withCustomerMold: number[];
  /** has_customer_mold = false veya null (kümülatif toplam) */
  withoutCustomerMold: number[];
};

export type VariantDistributionItem = {
  label: string;
  value: number;
};

export type VariantDistributionResult = {
  items: VariantDistributionItem[];
};

export type CategoryDistributionItem = {
  label: string;
  value: number;
};

export type CategoryDistributionResult = {
  items: CategoryDistributionItem[];
};

export type MonthlyVariantSeriesItem = {
  label: string;
  data: number[];
};

export type MonthlyVariantSeriesResult = {
  labels: string[];
  items: MonthlyVariantSeriesItem[];
};

const MONTH_NAMES_TR: string[] = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

type MonthBucket = {
  key: string;   // YYYY-MM
  label: string; // "Oca 2025" gibi
  start: Date;
  end: Date;
};

function buildMonthBuckets(monthCount: number): MonthBucket[] {
  const count = Math.max(1, Math.floor(monthCount));
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTH_NAMES_TR[d.getMonth()]} ${d.getFullYear()}`;
    buckets.push({ key, label, start, end });
  }

  return buckets;
}

/** Basit dizi → kümülatif dizi helper */
function toCumulativeArray(arr: number[]): number[] {
  const result: number[] = new Array(arr.length);
  let running = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const v = Number.isFinite(arr[i]) ? arr[i] : 0;
    running += v;
    result[i] = running;
  }
  return result;
}

/** Slug görünümlü string’leri insan okunur hale getirir */
function humanizeFallback(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.trim();
  if (!s) return null;
  if (isSlugLike(s)) {
    return humanizeSystemSlug(s);
  }
  return s;
}

/**
 * Son N ay için KÜMÜLATİF toplam ürün sayısı:
 * - all: tüm ürünler
 * - withCustomerMold: has_customer_mold = true
 * - withoutCustomerMold: has_customer_mold = false veya null
 */
export async function getMonthlyProductsSeries(monthCount = 12): Promise<MonthlyProductsSeries> {
  const buckets = buildMonthBuckets(monthCount);
  if (buckets.length === 0) {
    return {
      labels: [],
      all: [],
      withCustomerMold: [],
      withoutCustomerMold: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const firstStartIso = buckets[0].start.toISOString();

  // 1) Son N ay içindeki kayıtlar (aylık artışlar)
  const recentPromise = supabase
    .from('products')
    .select('created_at, has_customer_mold')
    .gte('created_at', firstStartIso);

  // 2) Bu N aydan ÖNCE var olan tüm ürün sayısı (baseline)
  const baselineAllPromise = supabase
    .from('products')
    .select('id', { head: true, count: 'exact' })
    .lt('created_at', firstStartIso);

  // 3) Bu N aydan ÖNCE has_customer_mold = true olan ürün sayısı
  const baselineWithPromise = supabase
    .from('products')
    .select('id', { head: true, count: 'exact' })
    .lt('created_at', firstStartIso)
    .eq('has_customer_mold', true);

  const [recentRes, baselineAllRes, baselineWithRes] = await Promise.all([
    recentPromise,
    baselineAllPromise,
    baselineWithPromise,
  ]);

  if (recentRes.error || !recentRes.data) {
    const labels = buckets.map((b) => b.label);
    return {
      labels,
      all: labels.map(() => 0),
      withCustomerMold: labels.map(() => 0),
      withoutCustomerMold: labels.map(() => 0),
    };
  }

  const baselineAll = (baselineAllRes.error ? 0 : baselineAllRes.count) ?? 0;
  const baselineWith = (baselineWithRes.error ? 0 : baselineWithRes.count) ?? 0;
  const baselineWithout = Math.max(0, baselineAll - baselineWith);

  type Row = { created_at: string | null; has_customer_mold: boolean | null };
  const rows: Row[] = (recentRes.data as Row[]).filter(
    (r) => typeof r.created_at === 'string',
  );

  // Aylık artışlar (delta)
  const totalCounts: number[] = new Array(buckets.length).fill(0);
  const withMoldCounts: number[] = new Array(buckets.length).fill(0);
  const withoutMoldCounts: number[] = new Array(buckets.length).fill(0);

  const findBucketIndex = (d: Date): number => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return buckets.findIndex((b) => b.key === key);
  };

  for (const row of rows) {
    const createdAt = row.created_at as string;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) {
      continue;
    }

    const bucketIndex = findBucketIndex(d);
    if (bucketIndex === -1) {
      continue;
    }

    totalCounts[bucketIndex] += 1;

    if (row.has_customer_mold === true) {
      withMoldCounts[bucketIndex] += 1;
    } else {
      // false veya null hepsi "yok" tarafına gider
      withoutMoldCounts[bucketIndex] += 1;
    }
  }

  // Aylık artışları kümülatif toplama çevir
  const cumulativeAll: number[] = new Array(buckets.length);
  const cumulativeWith: number[] = new Array(buckets.length);
  const cumulativeWithout: number[] = new Array(buckets.length);

  let runningAll = baselineAll;
  let runningWith = baselineWith;
  let runningWithout = baselineWithout;

  for (let i = 0; i < buckets.length; i += 1) {
    runningAll += totalCounts[i];
    runningWith += withMoldCounts[i];
    runningWithout += withoutMoldCounts[i];

    cumulativeAll[i] = runningAll;
    cumulativeWith[i] = runningWith;
    cumulativeWithout[i] = runningWithout;
  }

  return {
    labels: buckets.map((b) => b.label),
    all: cumulativeAll,
    withCustomerMold: cumulativeWith,
    withoutCustomerMold: cumulativeWithout,
  };
}

/** Variant dağılımını pie chart için hazırlar */
export async function getVariantDistribution(): Promise<VariantDistributionResult> {
  const supabase = await createSupabaseServerClient();

  const [productsRes, variantsRes] = await Promise.all([
    supabase.from('products').select('variant'),
    supabase.from('variants').select('key, name'),
  ]);

  if (productsRes.error || !productsRes.data) {
    return { items: [] };
  }

  type ProductRow = { variant: string | null };
  type VariantRow = { key: string | null; name: string | null };

  const productRows = productsRes.data as ProductRow[];
  const variantRows = (variantsRes.data ?? []) as VariantRow[];

  // key -> name map’i
  const nameByKey = new Map<string, string>();
  for (const row of variantRows) {
    const key = (row.key ?? '').trim();
    if (!key) continue;
    const name = (row.name ?? '').trim() || key;
    nameByKey.set(key, name);
  }

  const counts = new Map<string, number>();

  for (const row of productRows) {
    const raw = row.variant;

    let bucketKey: string;

    if (!raw) {
      bucketKey = '__none__';
    } else {
      const trimmed = raw.trim();
      if (!trimmed) {
        bucketKey = '__none__';
      } else {
        const lower = trimmed.toLowerCase();
        if (lower === 'none' || lower === 'null') {
          bucketKey = '__none__';
        } else {
          bucketKey = trimmed; // gerçek variant key
        }
      }
    }

    const prev = counts.get(bucketKey) ?? 0;
    counts.set(bucketKey, prev + 1);
  }

  const items: VariantDistributionItem[] = [];

  for (const [bucketKey, value] of counts.entries()) {
    let label: string;

    if (bucketKey === '__none__') {
      label = 'Belirtilmemiş';
    } else {
      const mappedName = nameByKey.get(bucketKey);
      label = mappedName ?? bucketKey;
    }

    items.push({ label, value });
  }

  items.sort((a, b) => b.value - a.value);

  return { items };
}

/** Kategori dağılımını pie chart için hazırlar (products.category_id + categories üzerinden) */
export async function getCategoryDistribution(): Promise<CategoryDistributionResult> {
  const supabase = await createSupabaseServerClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('category_id'),
    supabase.from('categories').select('id, slug, name'),
  ]);

  if (productsRes.error || !productsRes.data) {
    return { items: [] };
  }

  type ProductRow = { category_id: string | null };
  type CategoryRow = { id: string; slug: string | null; name: string | null };

  const productRows = productsRes.data as ProductRow[];
  const categoryRows = (categoriesRes.data ?? []) as CategoryRow[];

  // id -> label map'i (önce name, yoksa slug, o da yoksa id)
  const labelById = new Map<string, string>();

  for (const c of categoryRows) {
    const rawSlug = (c.slug ?? '').trim();
    const rawName = (c.name ?? '').trim();

    const humanSlug = rawSlug ? humanizeFallback(rawSlug) ?? rawSlug : '';
    const label = rawName || humanSlug || c.id;

    labelById.set(c.id, label);
  }

  const counts = new Map<string, number>();

  for (const row of productRows) {
    const catId = row.category_id;
    const bucketKey = catId ?? '__none__';
    const prev = counts.get(bucketKey) ?? 0;
    counts.set(bucketKey, prev + 1);
  }

  const items: CategoryDistributionItem[] = [];

  for (const [bucketKey, value] of counts.entries()) {
    let label: string;

    if (bucketKey === '__none__') {
      label = 'Belirtilmemiş';
    } else {
      label = labelById.get(bucketKey) ?? bucketKey;
    }

    items.push({ label, value });
  }

  items.sort((a, b) => b.value - a.value);

  return { items };
}

/**
 * Varyant bazlı aylık seri: her varyant için son N ayda
 * EKLENEN ürün sayıları kümülatif toplamlandı.
 * Yani data: [2, 3, 1] => [2, 5, 6]
 */
export async function getMonthlyVariantSeries(monthCount = 12): Promise<MonthlyVariantSeriesResult> {
  const buckets = buildMonthBuckets(monthCount);
  if (buckets.length === 0) {
    return { labels: [], items: [] };
  }

  const supabase = await createSupabaseServerClient();
  const firstStartIso = buckets[0].start.toISOString();

  const [productsRes, variantsRes] = await Promise.all([
    supabase
      .from('products')
      .select('created_at, variant')
      .gte('created_at', firstStartIso),
    supabase.from('variants').select('key, name'),
  ]);

  if (productsRes.error || !productsRes.data) {
    return {
      labels: buckets.map((b) => b.label),
      items: [],
    };
  }

  type ProductRow = { created_at: string | null; variant: string | null };
  type VariantRow = { key: string | null; name: string | null };

  const productRows = productsRes.data as ProductRow[];
  const variantRows = (variantsRes.data ?? []) as VariantRow[];

  const nameByKey = new Map<string, string>();
  for (const row of variantRows) {
    const key = (row.key ?? '').trim();
    if (!key) continue;
    const name = (row.name ?? '').trim() || key;
    nameByKey.set(key, name);
  }

  const countsByVariant = new Map<string, number[]>();

  const findBucketIndex = (d: Date): number => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return buckets.findIndex((b) => b.key === key);
  };

  const ensureCounts = (variantKey: string): number[] => {
    const existing = countsByVariant.get(variantKey);
    if (existing) return existing;
    const arr = new Array(buckets.length).fill(0);
    countsByVariant.set(variantKey, arr);
    return arr;
  };

  for (const row of productRows) {
    if (!row.created_at) continue;
    const d = new Date(row.created_at);
    if (Number.isNaN(d.getTime())) continue;

    const bucketIndex = findBucketIndex(d);
    if (bucketIndex === -1) continue;

    const rawVariant = row.variant;
    let variantKey: string;

    if (!rawVariant) {
      variantKey = '__none__';
    } else {
      const trimmed = rawVariant.trim();
      if (!trimmed) {
        variantKey = '__none__';
      } else {
        const lower = trimmed.toLowerCase();
        if (lower === 'none' || lower === 'null') {
          variantKey = '__none__';
        } else {
          variantKey = trimmed;
        }
      }
    }

    const counts = ensureCounts(variantKey);
    counts[bucketIndex] += 1;
  }

  const items: MonthlyVariantSeriesItem[] = [];

  const sum = (arr: number[]): number => arr.reduce((acc, v) => acc + v, 0);

  for (const [variantKey, counts] of countsByVariant.entries()) {
    let label: string;
    if (variantKey === '__none__') {
      label = 'Belirtilmemiş';
    } else {
      label = nameByKey.get(variantKey) ?? variantKey;
    }

    const cumulativeCounts = toCumulativeArray(counts);

    items.push({ label, data: cumulativeCounts });
  }

  items.sort((a, b) => sum(b.data) - sum(a.data));

  return {
    labels: buckets.map((b) => b.label),
    items,
  };
}
