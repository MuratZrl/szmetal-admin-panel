// src/features/products/components/form/sections/CategoryFields.client.tsx
'use client';

import * as React from 'react';

import { Grid, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import type { ProductFormValues } from '@/features/products/components/form/forms/schema';

import { useCategoryCascade } from '../hooks/useCategoryCascade';

import {
  PRODUCT_FORM_CATEGORY_ID,
  PRODUCT_FORM_SUBCATEGORY_ID,
  PRODUCT_FORM_SUBSUBCATEGORY_ID,
} from '@/features/products/components/form/constants/constants';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

const ITEM_HEIGHT = 40;
const MAX_VISIBLE_ITEMS = 7;
const SELECT_MENU_PROPS = {
  PaperProps: { sx: { maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS } },
} as const;

export function CategoryFields({ dicts }: { dicts: ProductDicts }): React.JSX.Element {
  const methods = useFormContext<FormType>();
  const {
    control,
    formState: { errors },
  } = methods;

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
    watchedCategory,
    watchedSubCategory,
    categoryLabelMap,
    subLabelMap,
  } = useCategoryCascade(methods, dicts);

  const toHelper = (m: unknown): string | undefined => (typeof m === 'string' ? m : undefined);

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
                id={PRODUCT_FORM_CATEGORY_ID}
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
                helperText={
                  !isCustomerMold && hasRootCategories ? toHelper(errors.category?.message) : undefined
                }
              >
                <MenuItem value="">
                  {isCustomerMold ? 'Kategori Yok (Müşteri Kalıbı)' : hasRootCategories ? 'Seçiniz' : 'Seçenek Yok'}
                </MenuItem>

                {rootCategoryOptions.map((c) => (
                  <MenuItem key={c.slug} value={c.slug}>
                    {c.name}
                  </MenuItem>
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
                id={PRODUCT_FORM_SUBCATEGORY_ID}
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
                    if (!slug) return watchedCategory ? 'Alt kategori seçin' : 'Önce kategori seçin';
                    return subLabelMap.get(slug) ?? slug;
                  },
                }}
                error={isSubRequired && !!errors.subCategory}
                helperText={isSubRequired ? toHelper(errors.subCategory?.message) : undefined}
              >
                <MenuItem value="">
                  {isCustomerMold
                    ? 'Alt Kategori Yok (Müşteri Kalıbı)'
                    : noSubCategoryLevel
                      ? 'Seçenek Yok'
                      : watchedCategory
                        ? 'Alt kategori seçin'
                        : 'Önce kategori seçin'}
                </MenuItem>

                {hasRealSubCategories
                  ? subCategoryOptions.map((sc) => (
                      <MenuItem key={sc.slug} value={sc.slug}>
                        {sc.name}
                      </MenuItem>
                    ))
                  : null}
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
                id={PRODUCT_FORM_SUBSUBCATEGORY_ID}
                select
                disabled={disabled}
                required={false}
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
                    if (!slug) {
                      return watchedSubCategory ? 'En alt kategori seçin (opsiyonel)' : 'Önce alt kategori seçin';
                    }
                    return subLabelMap.get(slug) ?? slug;
                  },
                }}
                error={false}
                helperText={undefined}
              >
                <MenuItem value="">
                  {isCustomerMold
                    ? 'En Alt Kategori Yok (Müşteri Kalıbı)'
                    : noSubCategoryLevel || noSubSubLevel
                      ? 'Seçenek Yok'
                      : watchedSubCategory
                        ? 'En alt kategori seçin (Opsiyonel)'
                        : 'Önce alt kategori seçin'}
                </MenuItem>

                {hasRealSubSubCategories
                  ? subSubCategoryOptions.map((sc) => (
                      <MenuItem key={sc.slug} value={sc.slug}>
                        {sc.name}
                      </MenuItem>
                    ))
                  : null}
              </TextField>
            );
          }}
        />
      </Grid>
    </>
  );
}
