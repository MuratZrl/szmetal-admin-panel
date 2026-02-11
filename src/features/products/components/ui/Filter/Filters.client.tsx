'use client';
// src/features/products/components/ui/Filter/Filters.client.tsx

import * as React from 'react';
import { Stack } from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';

import type { CategoryTree, VariantOption } from './types';
import { useProductFilters } from './hooks/useProductFilters';

import { SearchFilterSection } from '@/features/products/components/ui/Filter/sections/SearchFilter.client';
import { StatusFilterSection } from '@/features/products/components/ui/Filter/sections/StatusFilter.client';
import { CategoryFilterSection } from '@/features/products/components/ui/Filter/sections/CategoryFilter.client';
import { VariantFilterSection } from '@/features/products/components/ui/Filter/sections/VariantFilter.client';
import { DateRangeFilterSection } from '@/features/products/components/ui/Filter/sections/DateRangeFilter.client';
import { SortFilterSection } from '@/features/products/components/ui/Filter/sections/SortFilter.client';
import { ActionsSection } from '@/features/products/components/ui/Filter/sections/Actions.client';

type FiltersVariant = 'sidebar' | 'drawer';

type FiltersProps = {
  topLevelSlugs: string[];
  categoryTree: CategoryTree;
  variants: VariantOption[];
  variant?: FiltersVariant;
  stickyTop?: number;
};

export default function Filters({
  topLevelSlugs,
  categoryTree,
  variants,
  variant = 'sidebar',
  stickyTop = 16,
}: FiltersProps): React.JSX.Element {
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
    moldMode,
    setMoldMode,
    availabilityMode,
    setAvailabilityMode,
    variantQuery,
    setVariantQuery,
    expanded,
    setExpanded,
    reset,
  } = useProductFilters(categoryTree);

  const stickySx =
    variant === 'sidebar'
      ? {
          position: { xs: 'static', md: 'sticky' as const },
          top: { md: stickyTop },
        }
      : { position: 'static' as const };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Stack spacing={2.25} sx={stickySx}>
        <SearchFilterSection value={q} onChange={setQ} />

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

        <StatusFilterSection
          moldMode={moldMode}
          onChangeMoldMode={setMoldMode}
          availabilityMode={availabilityMode}
          onChangeAvailabilityMode={setAvailabilityMode}
        />

        <VariantFilterSection
          variants={variants}
          variantQuery={variantQuery}
          onChangeVariantQuery={setVariantQuery}
          variantsSel={variantsSel}
          setVariantsSel={setVariantsSel}
        />

        <DateRangeFilterSection from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

        <SortFilterSection sort={sort} onChangeSort={setSort} />

        <ActionsSection onReset={reset} />
      </Stack>
    </LocalizationProvider>
  );
}
