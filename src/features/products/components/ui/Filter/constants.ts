// src/features/products/components/ui/Filter/constants.ts
export const VISIBLE_VARIANT_ROWS = 7;
export const VARIANT_ROW_H_PX = 40;

export const VISIBLE_CATEGORY_ROWS = 7;
export const CATEGORY_ROW_H_PX = 62;

// Stable ids to avoid SSR/CSR hydration mismatches (MUI auto-id)
export const SEARCH_ID = 'products-filter-search';
export const STATUS_SELECT_ID = 'products-filter-status';
export const VARIANTS_ID = 'products-filter-variants';
export const CATEGORY_QUERY_ID = 'products-filter-category-query';
export const DATE_FROM_ID = 'products-filter-date-from';
export const DATE_TO_ID = 'products-filter-date-to';
export const SORT_SELECT_ID = 'products-filter-select';