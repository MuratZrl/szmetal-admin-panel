// src/features/products/components/form/ProductFormFields.tsx
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

// Date pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

// DİKKAT: Projendeki gerçek path neyse onu kullan.
import { useProductUpload } from '@/features/products/hooks/useProductUpload';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';

type WithFileFields = { file: File | null };
type FormType = ProductFormValues & WithFileFields;

type Props = {
  methods: UseFormReturn<FormType>;
  dicts: ProductDicts;
  /** Dosya alanını göster */
  showFileSection?: boolean;
  /** YÜKLENECEK KLASÖR: örn ürün id → "65800a9c-2153-4f55-a952-3f6d66b297c7" */
  dir: string;
};

// RHF FieldError.message → MUI helperText (ReactNode) güvenli dönüştürücü
function toHelper(m: unknown): string | undefined {
  return typeof m === 'string' ? m : undefined;
}

export default function ProductFormFields({ methods, dicts, showFileSection = true, dir }: Props) {
  const {
    control,
    register,
    setValue,
    watch,
    getValues,
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

  // Upload hook
  const up = useProductUpload(methods, dir);

  const dimPlaceholderSx: SxProps<Theme> = (theme) => ({
    '& input::placeholder, & textarea::placeholder': {
      opacity: 1,
      color: alpha(theme.palette.text.primary, 0.35),
    },
  });

  /* ------------------------------ DOSYA PICKER FIX ------------------------------ */

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = React.useCallback(() => {
    const el = fileInputRef.current;
    if (!el) return;
    el.value = '';
    el.click();
  }, []);

  const [pickerKey, bumpPickerKey] = React.useReducer((n: number) => (n + 1) % 1_000_000, 0);

  const handleConfirmDelete = React.useCallback(async () => {
    await up.confirmDelete();
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = '';
      } catch {}
    }
    bumpPickerKey();
  }, [up]);

  const variantLabel = React.useCallback(
    (key: string): string => {
      if (key === DEFAULT_VARIANT_KEY) return 'Yok';
      const found = variants.find((x) => x.key === key);
      return found ? found.name : key;
    },
    [variants],
  );

  // dayjs <-> string yardımcıları
  const toDayjs = React.useCallback((v: string | null | undefined): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v);
    return d.isValid() ? d : null;
  }, []);
  const toIso = React.useCallback((d: Dayjs | null): string => {
    return d ? d.format('YYYY-MM-DD') : '';
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Box sx={[{ mt: 0 }, dimPlaceholderSx]}>
        <Grid container spacing={2}>
          
          {/* 1. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Tam Ad"
              fullWidth
              required
              placeholder="Örn: Motor Kutusu Profili"
              {...register('name')}
              error={!!errors.name}
              helperText={toHelper(errors.name?.message)}
            />
          </Grid>
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

          {/* 2. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Kategori"
                  fullWidth
                  required
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const next = (e.target as HTMLInputElement).value;
                    const prev = (field.value as string | undefined) ?? '';
                    field.onChange(next);
                    if (prev !== next) {
                      setValue('subCategory', '', { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => {
                      const slug = String(v ?? '');
                      if (!slug) return 'Seçiniz';
                      return categoryLabelMap.get(slug) ?? slug;
                    },
                  }}
                  error={!!errors.category}
                  helperText={toHelper(errors.category?.message)}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {categoryOptions.map((c) => (
                    <MenuItem key={c.slug} value={c.slug}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* 3. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="subCategory"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Alt Kategori"
                  fullWidth
                  required
                  {...field}
                  value={field.value ?? ''}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => {
                      const slug = String(v ?? '');
                      if (!slug) return 'Seçiniz';
                      return subLabelMap.get(slug) ?? slug;
                    },
                  }}
                  onChange={(e) => {
                    const val = e.target.value as string;
                    field.onChange(val);
                    const cat = getValues('category');
                    if (!cat && val) {
                      const owner = findOwnerCategory(val);
                      if (owner) {
                        setValue('category', owner, { shouldValidate: true, shouldDirty: true });
                      }
                    }
                  }}
                  error={!!errors.subCategory}
                  helperText={toHelper(errors.subCategory?.message)}
                >
                  <MenuItem value="">
                    {watchedCategory ? 'Seçiniz' : 'Bir alt kategori seçin'}
                  </MenuItem>
                  {getSubCatsFor(watchedCategory).map((sc) => (
                    <MenuItem key={sc.slug} value={sc.slug}>
                      {sc.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Varyant: Varsayılan "Yok" */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="variant"
              control={control}
              render={({ field }) => {
                const safeValue =
                  typeof field.value === 'string' && field.value.trim() !== ''
                    ? field.value
                    : DEFAULT_VARIANT_KEY;

                return (
                  <TextField
                    {...field}
                    select
                    label="Varyant"
                    size="small"
                    fullWidth
                    value={safeValue}
                    onChange={(e) => field.onChange(e.target.value as string)}
                    error={!!errors.variant}
                    helperText={toHelper(errors.variant?.message)}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      renderValue: (v) => variantLabel(String(v)),
                    }}
                  >
                    <MenuItem value={DEFAULT_VARIANT_KEY}>Yok</MenuItem>
                    {variants
                      .filter((v) => v.key !== DEFAULT_VARIANT_KEY)
                      .map((v) => (
                        <MenuItem key={v.key} value={v.key}>
                          {v.name}
                        </MenuItem>
                      ))}
                  </TextField>
                );
              }}
            />
          </Grid>

          {/* KG/M GİRİŞİ */}
          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'unitWeightKg'>
              name="unitWeightKg"
              label="Birim Ağırlık (kg/m)"
              required
              endAdornmentText="kg/m"
            />
          </Grid>

          {/* Tarih */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Oluşturulma Tarihi"
                  format="DD/MM/YY"
                  value={toDayjs(field.value as string)}
                  onChange={(val) => field.onChange(toIso(val))}
                  slotProps={{
                    textField: {
                      required: true,
                      size: 'small',
                      fullWidth: true,
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

          {/* Revizyon Tarihi */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="revisionDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Revizyon Tarihi"
                  format="DD/MM/YY"
                  value={toDayjs(field.value as string)}
                  onChange={(val) => field.onChange(toIso(val))}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      size: 'small',
                      fullWidth: true,
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

          {/* 6. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="customerMold"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Müşteri Kalıbı"
                  size="small"
                  fullWidth
                  required
                  value={(field.value ?? 'Hayır') as CustomerMoldSelect}
                  onChange={(e) => field.onChange(e.target.value as CustomerMoldSelect)}
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
                  label="Kullanılabilirlik Durumu"
                  size="small"
                  fullWidth
                  required
                  value={String(field.value ?? true)}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    renderValue: (v) => (v === 'true' ? 'Kullanılabilir' : 'Kullanılamaz'),
                  }}
                  error={!!errors.availability}
                  helperText={toHelper(errors.availability?.message)}
                >
                  <MenuItem value="true">Kullanılabilir</MenuItem>
                  <MenuItem value="false">Kullanılamaz</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Çizen"
              fullWidth
              placeholder="Örn: Sacit Zorlu"
              {...register('drawer')}
              helperText={toHelper(errors.drawer?.message)}
              error={!!errors.drawer}
            />
          </Grid>

          {/* 5. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Kontrol"
              fullWidth
              placeholder="Örn: Eyüp Güzel"
              {...register('control')}
              helperText={toHelper(errors.control?.message)}
              error={!!errors.control}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ölçek"
              fullWidth
              placeholder="Örn: 2/1"
              {...register('scale')}
              helperText={toHelper(errors.scale?.message)}
              error={!!errors.scale}
            />
          </Grid>

          {/* 7. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'outerSizeMm'>
              name="outerSizeMm"
              label="Dış Çevre"
              endAdornmentText="mm"
            />
          </Grid>

          {/* 8. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'sectionMm2'>
              name="sectionMm2"
              label="Kesit"
              endAdornmentText="mm²"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Üretici Kodu"
              fullWidth
              placeholder="Örn: Ü-512"
              {...register('manufacturerCode')}
              helperText={toHelper(errors.manufacturerCode?.message)}
              error={!!errors.manufacturerCode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Geçici Kod"
              fullWidth
              placeholder="Örn: GÇE-001"
              {...register('tempCode')}
              helperText={toHelper(errors.tempCode?.message)}
              error={!!errors.tempCode}
            />
          </Grid>

          {/* 10. Satır: Dosya Alanı */}
          {showFileSection && (
            <Grid size={{ xs: 12 }}>
              <Box>
                <input
                  key={pickerKey}
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf, image/png, image/webp, image/jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => up.pick(e.currentTarget.files?.[0] ?? null)}
                />

                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
                  <Button
                    variant="outlined"
                    color="contrast"
                    startIcon={up.fileMeta?.kind === 'pdf' ? <PictureAsPdfIcon /> : <ImageIcon />}
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
                    onClick={up.openDelete}
                    disabled={(!up.uploadedRef && !watch('image')) || up.uploading || isSubmitting}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    Sil
                  </Button>

                  <Box sx={{ textAlign: 'right', opacity: 0.8, fontSize: 13 }}>
                    {up.fileMeta
                      ? `${up.fileMeta.name} yüklendi (${up.fileMeta.kind.toUpperCase()})`
                      : watch('image')
                      ? 'Dosya yüklü'
                      : 'Henüz dosya seçilmedi'}
                  </Box>
                </Stack>

                {errors.image && <FormHelperText error>{toHelper(errors.image.message)}</FormHelperText>}
              </Box>
            </Grid>
          )}

          {/* Silme onayı */}
          <Grid size={{ xs: 12 }}>
            <ConfirmDialog
              open={up.confirmOpen}
              title="Dosyayı sil"
              description="Yüklediğiniz dosyayı sunucudan kaldırmak ve formdan temizlemek istiyor musunuz?"
              confirmText="Evet, sil"
              cancelText="Vazgeç"
              onClose={up.closeDelete}
              onConfirm={handleConfirmDelete}
            />
          </Grid>
          
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
