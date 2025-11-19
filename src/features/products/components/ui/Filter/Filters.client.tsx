// src/features/products/components/ui/Filter/Filters.client.tsx
'use client';

import { Stack } from '@mui/material';

// MUI X Date Pickers + dayjs
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';

import type { CategoryTree, VariantOption } from './types';
import { useProductFilters } from './hooks/useProductFilters';
import { SearchFilterSection } from '@/features/products/components/ui/Filter/sections/SearchFilter';
import { StatusFilterSection } from '@/features/products/components/ui/Filter/sections/StatusFilter';
import { CategoryFilterSection } from '@/features/products/components/ui/Filter/sections/CategoryFilter';
import { VariantFilterSection } from '@/features/products/components/ui/Filter/sections/VariantFilter';
import { DateRangeFilterSection } from '@/features/products/components/ui/Filter/sections/DateRangeFilter';
import { SortFilterSection } from '@/features/products/components/ui/Filter/sections/SortFilter';
import { ActionsSection } from '@/features/products/components/ui/Filter/sections/Actions';

export default function Filters({
  topLevelSlugs,
  categoryTree,
  variants,
}: {
  topLevelSlugs: string[];
  categoryTree: CategoryTree;
  variants: VariantOption[];
}) {
  const {
    q,
    setQ,
    categories,
    setCategories,
    subCategories,
    setSubCategories,
    variantsSel,
    setVariantsSel,
    from,
    setFrom,
    to,
    setTo,
    sort,
    setSort,
    moldOnly,
    setMoldOnly,
    availableOnly,
    setAvailableOnly,
    variantQuery,
    setVariantQuery,
    expanded,
    setExpanded,
    reset,
  } = useProductFilters(categoryTree);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={2.25} sx={{ position: 'sticky', top: 16 }}>
        <SearchFilterSection value={q} onChange={setQ} />

        <StatusFilterSection
          moldOnly={moldOnly}
          onToggleMold={() => setMoldOnly((p) => !p)}
          availableOnly={availableOnly}
          onToggleAvailable={() => setAvailableOnly((p) => !p)}
        />

        <CategoryFilterSection
          topLevelSlugs={topLevelSlugs}
          categoryTree={categoryTree}
          categories={categories}
          subCategories={subCategories}
          expanded={expanded}
          setCategories={setCategories}
          setSubCategories={setSubCategories}
          setExpanded={setExpanded}
        />

        <VariantFilterSection
          variants={variants}
          variantQuery={variantQuery}
          onChangeVariantQuery={setVariantQuery}
          variantsSel={variantsSel}
          setVariantsSel={setVariantsSel}
        />

        <DateRangeFilterSection
          from={from}
          to={to}
          onChangeFrom={setFrom}
          onChangeTo={setTo}
        />

        <SortFilterSection sort={sort} onChangeSort={setSort} />

        <ActionsSection onReset={reset} />
      </Stack>
    </LocalizationProvider>
  );
}
