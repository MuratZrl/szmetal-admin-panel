// src/features/products_analytics/services/charts.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export type MonthlyProductsSeries = {
  labels: string[];
  data: number[];
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

/** Son N ayda eklenen ürün sayısı (ay bazında) */
export async function getMonthlyProductsSeries(monthCount = 12): Promise<MonthlyProductsSeries> {
  const buckets = buildMonthBuckets(monthCount);
  if (buckets.length === 0) {
    return { labels: [], data: [] };
  }

  const supabase = await createSupabaseServerClient();

  const firstStartIso = buckets[0].start.toISOString();

  const { data, error } = await supabase
    .from('products')
    .select('created_at')
    .gte('created_at', firstStartIso);

  if (error || !data) {
    return {
      labels: buckets.map((b) => b.label),
      data: buckets.map(() => 0),
    };
  }

  type Row = { created_at: string | null };
  const rows: Row[] = (data as Row[]).filter((r) => typeof r.created_at === 'string');

  const countsByKey: Record<string, number> = {};

  for (const row of rows) {
    const createdAt = row.created_at as string;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) {
      continue;
    }
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const prev = countsByKey[key] ?? 0;
    countsByKey[key] = prev + 1;
  }

  const labels = buckets.map((b) => b.label);
  const dataPoints = buckets.map((b) => countsByKey[b.key] ?? 0);

  return { labels, data: dataPoints };
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

/** Kategori dağılımını pie chart için hazırlar (products.category üzerinden) */
export async function getCategoryDistribution(): Promise<CategoryDistributionResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('category');

  if (error || !data) {
    return { items: [] };
  }

  type ProductRow = { category: string | null };
  const rows = data as ProductRow[];

  const counts = new Map<string, number>();

  for (const row of rows) {
    const raw = row.category;

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
          bucketKey = trimmed;
        }
      }
    }

    const prev = counts.get(bucketKey) ?? 0;
    counts.set(bucketKey, prev + 1);
  }

  const items: CategoryDistributionItem[] = [];

  for (const [bucketKey, value] of counts.entries()) {
    let label: string;

    if (bucketKey === '__none__') {
      label = 'Belirtilmemiş';
    } else {
      label = bucketKey;
    }

    items.push({ label, value });
  }

  items.sort((a, b) => b.value - a.value);

  return { items };
}

/** Varyant bazlı aylık seri: her varyant için son N ayda eklenen ürün sayısı */
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
    items.push({ label, data: counts });
  }

  items.sort((a, b) => sum(b.data) - sum(a.data));

  return {
    labels: buckets.map((b) => b.label),
    items,
  };
}
