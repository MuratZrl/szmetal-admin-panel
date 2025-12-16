// src/features/products/components/form/sections/CategoryFields.client.tsx
'use client';

import * as React from 'react';

import { Grid, TextField, MenuItem } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import type { ProductDicts } from '@/features/products/services/dicts.server';
import type { ProductFormValues } from '@/features/products/forms/schema';
import { useCategoryCascade } from '../hooks/useCategoryCascade';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

const ITEM_HEIGHT = 40;
const MAX_VISIBLE_ITEMS = 7;
const SELECT_MENU_PROPS = { PaperProps: { sx: { maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS } } } as const;

export function CategoryFields({ dicts }: { dicts: ProductDicts }) {
  const methods = useFormContext<FormType>();
  const { control, formState: { errors } } = methods;

  const {
    isCustomerMold,
    hasRootCategories,
    rootCategoryOptions,
    subCategoryOptions,
    subSubCategoryOptions,
    hasRealSubCategories,
    hasRealSubSubCategories,
    noSubCategoryLevel,
    noSubSubLevel,
    isSubRequired,
    isSubSubRequired,
    watchedCategory,
    watchedSubCategory,
    categoryLabelMap,
    subLabelMap,
  } = useCategoryCascade(methods, dicts);

  const toHelper = (m: unknown) => (typeof m === 'string' ? m : undefined);

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="category"
          control={control}
          render={({ field }) => {
            const disabled = isCustomerMold || !hasRootCategories;
            return (
              <TextField
                select
                disabled={disabled}
                required={!isCustomerMold && hasRootCategories}
                label="Kategori"
                {...field}
                value={field.value ?? ''}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: SELECT_MENU_PROPS,
                  renderValue: (v) => {
                    const slug = String(v ?? '');
                    if (!slug) {
                      if (isCustomerMold) return 'Kategori Yok (Müşteri Kalıbı)';
                      if (!hasRootCategories) return 'Seçenek Yok';
                      return 'Seçiniz';
                    }
                    return categoryLabelMap.get(slug) ?? slug;
                  },
                }}
                error={!isCustomerMold && hasRootCategories && !!errors.category}
                helperText={!isCustomerMold && hasRootCategories ? toHelper(errors.category?.message) : undefined}
              >
                <MenuItem value="">
                  {isCustomerMold ? 'Kategori Yok (Müşteri Kalıbı)' : hasRootCategories ? 'Seçiniz' : 'Seçenek Yok'}
                </MenuItem>
                {rootCategoryOptions.map((c) => (
                  <MenuItem key={c.slug} value={c.slug}>{c.name}</MenuItem>
                ))}
              </TextField>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="subCategory"
          control={control}
          render={({ field }) => {
            const disabled = isCustomerMold || noSubCategoryLevel;
            return (
              <TextField
                select
                disabled={disabled}
                required={isSubRequired}
                label="Alt Kategori"
                {...field}
                value={field.value ?? ''}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: SELECT_MENU_PROPS,
                  renderValue: (v) => {
                    if (isCustomerMold) return 'Alt Kategori Yok (Müşteri Kalıbı)';
                    if (noSubCategoryLevel) return 'Seçenek Yok';
                    const slug = String(v ?? '');
                    if (!slug) return watchedCategory ? 'Seçiniz' : 'Alt kategoriyi seçin';
                    return subLabelMap.get(slug) ?? slug;
                  },
                }}
                error={isSubRequired && !!errors.subCategory}
                helperText={isSubRequired ? toHelper(errors.subCategory?.message) : undefined}
              >
                <MenuItem value="">
                  {isCustomerMold ? 'Alt Kategori Yok (Müşteri Kalıbı)' : noSubCategoryLevel ? 'Seçenek Yok' : watchedCategory ? 'Seçiniz' : 'Alt kategoriyi seçin'}
                </MenuItem>
                {hasRealSubCategories && subCategoryOptions.map((sc) => (
                  <MenuItem key={sc.slug} value={sc.slug}>{sc.name}</MenuItem>
                ))}
              </TextField>
            );
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="subSubCategory"
          control={control}
          render={({ field }) => {
            const disabled = isCustomerMold || noSubCategoryLevel || noSubSubLevel;
            return (
              <TextField
                select
                disabled={disabled}
                required={isSubSubRequired}
                label="En Alt Kategori"
                {...field}
                value={field.value ?? ''}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  MenuProps: SELECT_MENU_PROPS,
                  renderValue: (v) => {
                    if (isCustomerMold) return 'En Alt Kategori Yok (Müşteri Kalıbı)';
                    if (noSubCategoryLevel || noSubSubLevel) return 'Seçenek Yok';
                    const slug = String(v ?? '');
                    if (!slug) return !watchedSubCategory ? 'En alt kategoriyi seçin' : !hasRealSubSubCategories ? 'Seçenek Yok' : 'Seçiniz';
                    return subLabelMap.get(slug) ?? slug;
                  },
                }}
                error={isSubSubRequired && !!errors.subSubCategory}
                helperText={isSubSubRequired ? toHelper(errors.subSubCategory?.message) : undefined}
              >
                <MenuItem value="">
                  {isCustomerMold ? 'En Alt Kategori Yok (Müşteri Kalıbı)' : (noSubCategoryLevel || noSubSubLevel) ? 'Seçenek Yok' : watchedSubCategory ? 'Seçiniz' : 'En alt kategori seçin'}
                </MenuItem>
                {hasRealSubSubCategories && subSubCategoryOptions.map((sc) => (
                  <MenuItem key={sc.slug} value={sc.slug}>{sc.name}</MenuItem>
                ))}
              </TextField>
            );
          }}
        />
      </Grid>
    </>
  );
}
