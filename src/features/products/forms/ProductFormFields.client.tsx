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

import { Controller, type UseFormReturn } from 'react-hook-form';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import NumberField from '@/features/products/components/form/NumberField';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

import {
  type ProductFormValues,
  type CustomerMoldSelect,
} from '@/features/products/forms/schema';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';

// DİKKAT: Projendeki gerçek path neyse onu kullan.
import { useProductUpload } from '@/features/products/hooks/useProductUpload';

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

  // Upload hook: BURASI ÖNEMLİ — dir veriyoruz ki server imzalı URL'i bu klasör için üretsin
  const up = useProductUpload(methods, dir);

    /* ------------------------------ DOSYA PICKER FIX ------------------------------ */

  // 1) Native <input type="file">’ı ref ile kontrol edeceğiz
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // 2) Bazı tarayıcılar aynı dosya seçilince onChange’i çalıştırmıyor.
  // Her açmadan önce value='' ile sıfırla.
  const openPicker = React.useCallback(() => {
    const el = fileInputRef.current;
    if (!el) return;
    el.value = ''; // aynı dosyayı tekrar seçebilelim
    el.click();
  }, []);

  // 3) Silme sonrası da güvenli tarafta kalmak için input’u yeniden mount et
  const [pickerKey, bumpPickerKey] = React.useReducer((n: number) => (n + 1) % 1_000_000, 0);

  const handleConfirmDelete = React.useCallback(async () => {
    await up.confirmDelete();
    // native input değerini temizle
    if (fileInputRef.current) {
      try { fileInputRef.current.value = ''; } catch {}
    }
    // Hala sorun yaşayan tarayıcılar için yeniden mount et
    bumpPickerKey();
  }, [up]);

  return (
    <>
      <Box sx={{ mt: 0 }}>
        <Grid container spacing={2}>
          {/* 1. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Tam Ad"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={toHelper(errors.name?.message)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Kod"
              fullWidth
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="variant"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Varyant"
                  size="small"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value as string)}
                  error={!!errors.variant}
                  helperText={toHelper(errors.variant?.message)}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => {
                      const val = String(v ?? '');
                      if (!val) return 'Seçiniz';
                      return variants.find((x) => x.key === val)?.name ?? val;
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {variants.map((v) => (
                    <MenuItem key={v.key} value={v.key}>
                      {v.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <NumberField<FormType, 'unitWeightG'>
              name="unitWeightG"
              label="Birim Ağırlık"
              integer
              endAdornmentText="gr/m"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Tarih"
              type="date"
              fullWidth
              {...register('date')}
              error={!!errors.date}
              helperText={toHelper(errors.date?.message)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* 4. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Revizyon Tarihi"
              type="date"
              fullWidth
              {...register('revisionDate')}
              error={!!errors.revisionDate}
              helperText={toHelper(errors.revisionDate?.message)}
              InputLabelProps={{ shrink: true }}
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
                  value={String(field.value ?? true)}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    renderValue: (v) => (v === 'true' ? 'Kullanılabilir' : 'Kullanılamaz'),
                  }}
                  error={!!errors.availability}
                  helperText={errors.availability?.toString()}
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
              {...register('control')}
              helperText={toHelper(errors.control?.message)}
              error={!!errors.control}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ölçek"
              fullWidth
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
              {...register('manufacturerCode')}
              helperText={toHelper(errors.manufacturerCode?.message)}
              error={!!errors.manufacturerCode}
            />
          </Grid>

          {/* 9. Satır */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Profil Kodu"
              fullWidth
              {...register('profileCode')}
              helperText={toHelper(errors.profileCode?.message)}
              error={!!errors.profileCode}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Geçici Kod"
              fullWidth
              {...register('tempCode')}
              helperText={toHelper(errors.tempCode?.message)}
              error={!!errors.tempCode}
            />
          </Grid>

          {/* 10. Satır: Dosya Alanı (tek satır tam genişlik) */}
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
                    startIcon={up.fileMeta?.kind === 'pdf' ? <PictureAsPdfIcon /> : <ImageIcon />}
                    onClick={openPicker}
                    disabled={up.uploading || isSubmitting}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {up.uploading ? 'Yükleniyor…' : 'Dosya Seç ve Yükle'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
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
    </>
  );
}
