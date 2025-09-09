'use client';

import { useQuery, useQueryClient, keepPreviousData, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

export type ProductListParams = {
  page?: number;            // default 1
  limit?: number;           // default 20
  search?: string;
  category?: string | null;
  subCategory?: string | null;
  orderBy?: 'created_at' | 'name' | 'date';
  order?: 'asc' | 'desc';
};

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export type ProductListResult = {
  rows: ProductRow[];
  total: number;
};

async function fetchProducts(params: ProductListParams): Promise<ProductListResult> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (params.search && params.search.trim()) {
    q = q.ilike('name', `%${params.search.trim()}%`);
  }
  if (params.category) {
    q = q.eq('category', params.category);
  }
  if (params.subCategory) {
    // tablo kolonu text ise:
    q = q.eq('sub_category', params.subCategory);
  }

  const orderBy = params.orderBy ?? 'created_at';
  const ascending = (params.order ?? 'desc') === 'asc';
  q = q.order(orderBy, { ascending, nullsFirst: false });

  const { data, count, error } = await q;
  if (error) throw new Error(error.message);

  return { rows: data ?? [], total: count ?? 0 };
}

async function fetchProductById(id: number): Promise<ProductRow> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Liste sorgusu */
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Detay sorgusu */
export function useProduct(id: number | null | undefined) {
  return useQuery({
    queryKey: id ? productKeys.detail(id) : (['products', 'detail', 'disabled'] as QueryKey),
    queryFn: () => {
      if (!id) throw new Error('id gerekli');
      return fetchProductById(id);
    },
    enabled: typeof id === 'number' && id > 0,
    staleTime: 30_000,
  });
}

/** Kolay invalidation yardımcıları */
export function useInvalidateProducts() {
  const qc = useQueryClient();
  return {
    list: async (params?: ProductListParams) =>
      qc.invalidateQueries({ queryKey: params ? productKeys.list(params) : productKeys.lists() }),
    detail: async (id: number) =>
      qc.invalidateQueries({ queryKey: productKeys.detail(id) }),
    all: async () => qc.invalidateQueries({ queryKey: productKeys.all }),
  };
}
