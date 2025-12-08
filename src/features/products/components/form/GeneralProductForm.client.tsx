// === FINAL COMPLETE FILE WITH PLACEHOLDERS RESTORED ===
// === SUBCATEGORY REQUIRED LOGIC FIXED ===
// === MUI REQUIRED STAR BUG FULLY SOLVED ===

'use client';

import * as React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormHelperText,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { alpha, type Theme, type SxProps } from '@mui/material/styles';

import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import NumberField from '@/features/products/components/form/NumberField.client';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

import {
  type ProductFormValues,
  type CustomerMoldSelect,
  DEFAULT_VARIANT_KEY,
} from '@/features/products/forms/schema';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

import { useProductUpload } from '@/features/products/hooks/useProductUpload.client';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

type Props = {
  methods: UseFormReturn<FormType>;
  dicts: ProductDicts;
  showFileSection?: boolean;
  dir: string;
};

function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

const ITEM_HEIGHT = 40;
const MAX_VISIBLE_ITEMS = 7;

export default function ProductFormFields({
  methods,
  dicts,
  showFileSection = true,
  dir,
}: Props) {
  
  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const {
    categoryOptions,
    getSubCatsFor,
    categoryLabelMap,
    subLabelMap,
    findOwnerCategory,
  } = React.useMemo(() => buildCategoryHelpers(dicts?.categoryTree), [dicts]);

  const variants = dicts?.variants ?? [];

  const watchedCategory = watch('category');
  const watchedSubCategory = watch('subCategory');
  const watchedCustomerMold = watch('customerMold');

  const isCustomerMold = watchedCustomerMold === 'Evet';

  React.useEffect(() => {
    if (!watchedCategory) {
      setValue('subCategory', '', { shouldValidate: true });
      setValue('subSubCategory', '', { shouldValidate: true });
      return;
    }

    const subs = getSubCatsFor(watchedCategory);

    if (subs.length === 0) {
      setValue('subCategory', watchedCategory, { shouldValidate: true });
      setValue('subSubCategory', '', { shouldValidate: true });
    } else {
      const current = getValues('subCategory');
      if (current && !subs.some((s) => s.slug === current)) {
        setValue('subCategory', '', { shouldValidate: true });
      }
      setValue('subSubCategory', '', { shouldValidate: true });
    }
  }, [watchedCategory, getSubCatsFor, setValue, getValues]);

  React.useEffect(() => {
    if (!watchedSubCategory) {
      setValue('subSubCategory', '', { shouldValidate: true });
      return;
    }

    const subs = getSubCatsFor(watchedSubCategory);
    const current = getValues('subSubCategory');

    if (subs.length === 0) {
      setValue('subSubCategory', '', { shouldValidate: true });
    } else if (current && !subs.some((s) => s.slug === current)) {
      setValue('subSubCategory', '', { shouldValidate: true });
    }
  }, [watchedSubCategory, getSubCatsFor, setValue, getValues]);

  React.useEffect(() => {
    if (!isCustomerMold) return;

    setValue('category', '', { shouldValidate: true });
    setValue('subCategory', '', { shouldValidate: true });
    setValue('subSubCategory', '', { shouldValidate: true });
  }, [isCustomerMold, setValue]);

  const rootCategoryOptions = React.useMemo(() => {
    const tree = dicts?.categoryTree;
    if (!tree) return categoryOptions;

    const childSlugs = new Set<string>();
    Object.values(tree).forEach((node) =>
      node.subs.forEach((s) => childSlugs.add(s.slug)),
    );

    return categoryOptions.filter((c) => !childSlugs.has(c.slug));
  }, [dicts, categoryOptions]);

  const hasRootCategories = rootCategoryOptions.length > 0;

  const subCategoryOptions = watchedCategory ? getSubCatsFor(watchedCategory) : [];
  const subSubCategoryOptions = watchedSubCategory
    ? getSubCatsFor(watchedSubCategory)
    : [];

  const hasRealSubCategories = subCategoryOptions.length > 0;
  const hasRealSubSubCategories = subSubCategoryOptions.length > 0;

  const noSubCategoryLevel =
    !!watchedCategory && !hasRealSubCategories && !isCustomerMold;

  const noSubSubLevel =
    !!watchedCategory &&
    hasRealSubCategories &&
    !hasRealSubSubCategories &&
    !isCustomerMold;

  const isSubRequired =
    !isCustomerMold && hasRealSubCategories && !noSubCategoryLevel;

  const isSubSubRequired =
    !isCustomerMold &&
    hasRealSubSubCategories &&
    !noSubCategoryLevel &&
    !noSubSubLevel;

  const up = useProductUpload(methods, dir);

  const dimPlaceholderSx: SxProps<Theme> = (theme) => ({
    '& input::placeholder, & textarea::placeholder': {
      color: alpha(theme.palette.text.primary, 0.35),
    },
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const [pickerKey, bumpPickerKey] = React.useReducer((n) => (n + 1) % 999_999, 0);

  const handleConfirmDelete = async () => {
    await up.confirmDelete();
    if (fileInputRef.current) fileInputRef.current.value = '';
    bumpPickerKey();
  };

  const toDayjs = (v: string | undefined | null): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v);
    return d.isValid() ? d : null;
  };

  const toIso = (d: Dayjs | null): string => (d ? d.format('YYYY-MM-DD') : '');

  const variantLabel = (k: string): string => {
    if (k === DEFAULT_VARIANT_KEY) return 'Yok';
    return variants.find((v) => v.key === k)?.name ?? k;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Box sx={[{ mt: 0 }, dimPlaceholderSx]}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Kod"
              fullWidth
              required
              placeholder="Örn: T.3152"
              {...register('code')}
              error={!!errors.code}
              helperText={toHelper(errors.code?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ad"
              fullWidth
              required
              placeholder="Örn: Motor Kutusu Profili"
              {...register('name')}
              error={!!errors.name}
              helperText={toHelper(errors.name?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="customerMold"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Müşteri Kalıbı"
                  fullWidth
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.customerMold}
                  helperText={toHelper(errors.customerMold?.message)}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="availability"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label="Kullanılabilirlik Durumu"
                  value={String(field.value)}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    renderValue: (v) =>
                      v === 'true' ? 'Kullanılabilir' : 'Kullanılamaz',
                  }}
                >
                  <MenuItem value="true">Kullanılabilir</MenuItem>
                  <MenuItem value="false">Kullanılamaz</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => {
                const disabled = isCustomerMold || !hasRootCategories;

                return (
                  <TextField
                    select
                    fullWidth
                    disabled={disabled}
                    required={!isCustomerMold && hasRootCategories}
                    label="Kategori"
                    {...field}
                    value={field.value ?? ''}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: { maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS },
                        },
                      },
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
                      !isCustomerMold && hasRootCategories
                        ? toHelper(errors.category?.message)
                        : undefined
                    }
                  >
                    <MenuItem value="">
                      {isCustomerMold
                        ? 'Kategori Yok (Müşteri Kalıbı)'
                        : hasRootCategories
                        ? 'Seçiniz'
                        : 'Seçenek Yok'}
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

          {/* ALT KATEGORİ: BURASI DÜZELTİLEN KISIM */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="subCategory"
              control={control}
              render={({ field }) => {
                const disabled = isCustomerMold || noSubCategoryLevel;

                return (
                  <TextField
                    select
                    fullWidth
                    disabled={disabled}
                    required={isSubRequired}
                    label="Alt Kategori"
                    {...field}
                    value={field.value ?? ''}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: { maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS },
                        },
                      },
                      renderValue: (v) => {
                        if (isCustomerMold) {
                          return 'Alt Kategori Yok (Müşteri Kalıbı)';
                        }
                        if (noSubCategoryLevel) {
                          return 'Seçenek Yok';
                        }
                        const slug = String(v ?? '');
                        if (!slug) {
                          return watchedCategory
                            ? 'Seçiniz'
                            : 'Alt kategoriyi seçin';
                        }
                        return subLabelMap.get(slug) ?? slug;
                      },
                    }}
                    error={isSubRequired && !!errors.subCategory}
                    helperText={
                      isSubRequired ? toHelper(errors.subCategory?.message) : undefined
                    }
                  >
                    <MenuItem value="">
                      {isCustomerMold
                        ? 'Alt Kategori Yok (Müşteri Kalıbı)'
                        : noSubCategoryLevel
                        ? 'Seçenek Yok'
                        : watchedCategory
                        ? 'Seçiniz'
                        : 'Alt kategoriyi seçin'}
                    </MenuItem>

                    {hasRealSubCategories &&
                      subCategoryOptions.map((sc) => (
                        <MenuItem key={sc.slug} value={sc.slug}>
                          {sc.name}
                        </MenuItem>
                      ))}
                  </TextField>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="variant"
              control={control}
              render={({ field }) => {
                const v =
                  typeof field.value === 'string' && field.value.trim()
                    ? field.value
                    : DEFAULT_VARIANT_KEY;

                return (
                  <TextField
                    select
                    fullWidth
                    label="Varyant"
                    size="small"
                    {...field}
                    value={v}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      renderValue: (val) => variantLabel(String(val)),
                    }}
                  >
                    <MenuItem value={DEFAULT_VARIANT_KEY}>Yok</MenuItem>

                    {variants
                      .filter((x) => x.key !== DEFAULT_VARIANT_KEY)
                      .map((x) => (
                        <MenuItem key={x.key} value={x.key}>
                          {x.name}
                        </MenuItem>
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
                    fullWidth
                    disabled={disabled}
                    required={isSubSubRequired}
                    label="En Alt Kategori"
                    {...field}
                    value={field.value ?? ''}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      MenuProps: {
                        PaperProps: {
                          sx: { maxHeight: ITEM_HEIGHT * MAX_VISIBLE_ITEMS },
                        },
                      },
                      renderValue: (v) => {
                        if (isCustomerMold) {
                          return 'En Alt Kategori Yok (Müşteri Kalıbı)';
                        }
                        if (noSubCategoryLevel) {
                          return 'Seçenek Yok';
                        }
                        if (noSubSubLevel) {
                          return 'Seçenek Yok';
                        }
                        const slug = String(v ?? '');
                        if (!slug) {
                          if (!watchedSubCategory) return 'En alt kategoriyi seçin';
                          if (!hasRealSubSubCategories) return 'Seçenek Yok';
                          return 'Seçiniz';
                        }
                        return subLabelMap.get(slug) ?? slug;
                      },
                    }}
                    error={isSubSubRequired && !!errors.subSubCategory}
                    helperText={
                      isSubSubRequired
                        ? toHelper(errors.subSubCategory?.message)
                        : undefined
                    }
                  >
                    <MenuItem value="">
                      {isCustomerMold
                        ? 'En Alt Kategori Yok (Müşteri Kalıbı)'
                        : noSubCategoryLevel
                        ? 'Seçenek Yok'
                        : noSubSubLevel
                        ? 'Seçenek Yok'
                        : watchedSubCategory
                        ? 'Seçiniz'
                        : 'En alt kategori seçin'}
                    </MenuItem>

                    {hasRealSubSubCategories &&
                      subSubCategoryOptions.map((sc) => (
                        <MenuItem key={sc.slug} value={sc.slug}>
                          {sc.name}
                        </MenuItem>
                      ))}
                  </TextField>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'unitWeightG'>
              name="unitWeightG"
              label="Birim Ağırlık (gr/m)"
              required
              endAdornmentText="gr/m"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'wallThicknessMm'>
              name="wallThicknessMm"
              label="Et Kalınlığı (mm)"
              endAdornmentText="mm"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Çizildiği Tarih"
                  format="DD/MM/YY"
                  value={toDayjs(field.value)}
                  onChange={(v) => field.onChange(toIso(v))}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      size: 'small',
                      InputLabelProps: { shrink: true },
                      error: !!errors.date,
                      helperText: toHelper(errors.date?.message),
                      placeholder: 'YYYY-MM-DD',
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="revisionDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Revizyon Tarihi"
                  format="DD/MM/YY"
                  value={toDayjs(field.value)}
                  onChange={(v) => field.onChange(toIso(v))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputLabelProps: { shrink: true },
                      error: !!errors.revisionDate,
                      helperText: toHelper(errors.revisionDate?.message),
                      placeholder: 'YYYY-MM-DD',
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Çizen"
              fullWidth
              placeholder="Örn: Sacit Zorlu"
              {...register('drawer')}
              error={!!errors.drawer}
              helperText={toHelper(errors.drawer?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Kontrol"
              fullWidth
              placeholder="Örn: Eyüp Güzel"
              {...register('control')}
              error={!!errors.control}
              helperText={toHelper(errors.control?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ölçek"
              fullWidth
              placeholder="Örn: 2/1"
              {...register('scale')}
              error={!!errors.scale}
              helperText={toHelper(errors.scale?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'sectionMm2'>
              name="sectionMm2"
              label="Kesit (mm²)"
              endAdornmentText="mm²"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Üretici Kodu"
              fullWidth
              placeholder="Örn: Ü-512"
              {...register('manufacturerCode')}
              error={!!errors.manufacturerCode}
              helperText={toHelper(errors.manufacturerCode?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Geçici Kod"
              fullWidth
              placeholder="Örn: GÇE-001"
              {...register('tempCode')}
              error={!!errors.tempCode}
              helperText={toHelper(errors.tempCode?.message)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'outerSizeMm'>
              name="outerSizeMm"
              label="Dış Çevre (mm)"
              endAdornmentText="mm"
            />
          </Grid>

          {showFileSection && (
            <Grid size={{ xs: 12 }}>
              <input
                key={pickerKey}
                ref={fileInputRef}
                type="file"
                accept="application/pdf, image/png, image/webp, image/jpeg"
                style={{ display: 'none' }}
                onChange={(e) => up.pick(e.target.files?.[0] ?? null)}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  color="contrast"
                  startIcon={
                    up.fileMeta?.kind === 'pdf' ? <PictureAsPdfIcon /> : <ImageIcon />
                  }
                  onClick={openPicker}
                  disabled={up.uploading || isSubmitting}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {up.uploading ? 'Yükleniyor…' : 'Dosya Seç ve Yükle'}
                </Button>

                <Button
                  variant="outlined"
                  color="contrast"
                  startIcon={<DeleteOutlineIcon />}
                  disabled={
                    (!up.uploadedRef && !watch('image')) ||
                    up.uploading ||
                    isSubmitting
                  }
                  onClick={up.openDelete}
                  sx={{ textTransform: 'capitalize' }}
                >
                  Sil
                </Button>

                <Box sx={{ opacity: 0.8, fontSize: 13 }}>
                  {up.fileMeta
                    ? `${up.fileMeta.name} (${up.fileMeta.kind.toUpperCase()})`
                    : watch('image')
                    ? 'Dosya yüklü'
                    : 'Henüz dosya seçilmedi'}
                </Box>
              </Stack>

              {errors.image && (
                <FormHelperText error>
                  {toHelper(errors.image.message)}
                </FormHelperText>
              )}
            </Grid>
          )}

          <ConfirmDialog
            open={up.confirmOpen}
            title="Dosyayı sil"
            description="Yüklediğiniz dosyayı kaldırmak istiyor musunuz?"
            confirmText="Evet"
            cancelText="Vazgeç"
            onClose={up.closeDelete}
            onConfirm={handleConfirmDelete}
          />
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
