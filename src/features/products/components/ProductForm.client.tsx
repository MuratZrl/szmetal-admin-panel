'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper, Box, Grid, TextField, MenuItem, Button, Stack, FormHelperText
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { FormProvider, useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import { createProduct } from '@/features/products/services/products.client';
import { removeUploaded, uploadProductPdfAndGetUrl, uploadProductImageAndGetUrl, UploadRef, UploadResult } from '@/features/products/services/storage.client';

import { supabase } from '@/lib/supabase/supabaseClient';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import FormSection from '@/features/products/components/form/FormSection';
import NumberField from '@/features/products/components/form/NumberField';
import { productSchema, type ProductFormValues } from '@/features/products/forms/schema';
import { newProductDefaults } from '@/features/products/forms/defaultValues';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

type Props = { dicts: ProductDicts };

// create formu: ortak model + file alanı
type CreateValues = ProductFormValues & { file: File | null };


function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;

  if (typeof err === 'object' && err !== null) {
    // supabase-js çoğu zaman { error: { message } } döner
    const maybeMsg = (err as { message?: unknown }).message;
    if (typeof maybeMsg === 'string') return maybeMsg;

    const inner = (err as { error?: { message?: unknown } }).error;
    if (inner && typeof inner.message === 'string') return inner.message;

    try {
      return JSON.stringify(err);
    } catch {
      /* fallthrough */
    }
  }
  return String(err);
}

export default function ProductForm({ dicts }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  const defaultValues = React.useMemo<CreateValues>(
    () => ({ ...newProductDefaults, file: null }),
    []
  );

  const methods = useForm<CreateValues>({
    resolver: yupResolver(productSchema) as unknown as Resolver<CreateValues>,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch,
    setValue,
    reset,
  } = methods;

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Dicts yardımcıları
  const variants = dicts?.variants ?? [];
  
  const { categoryOptions, getSubCatsFor, categoryLabelMap, subLabelMap, findOwnerCategory } =
    React.useMemo(() => buildCategoryHelpers(dicts?.categoryTree), [dicts]);

  const watchedCategory = watch('category');

  // Upload state
  const [uploadingFile, setUploadingFile] = React.useState(false);

  const [fileMeta, setFileMeta] =
    React.useState<{ name: string; kind: 'pdf' | 'image' } | null>(null);

  const [uploadedRef, setUploadedRef] = React.useState<UploadRef | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const ACCEPTED_MIME: ReadonlySet<string> =
    new Set(['application/pdf', 'image/png', 'image/webp', 'image/jpeg']);

  const MAX_BYTES: Readonly<Record<'pdf' | 'image', number>> = {
    pdf: 10 * 1024 * 1024,
    image: 8 * 1024 * 1024,
  };

  function classify(file: File): 'pdf' | 'image' | null {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/') && ACCEPTED_MIME.has(file.type)) return 'image';
    return null;
  }

  // PDF + Görsel tek handler
  async function handleFilePick(file?: File | null) {
    if (!file) return;

    const kind = classify(file);
    
    if (!kind) {
      show('Sadece PDF, PNG, WEBP, JPEG kabul ediyorum.', 'error');
      return;
    }

    const limit = MAX_BYTES[kind];
    if (file.size > limit) {
      const mb = (limit / (1024 * 1024)).toFixed(0);
      show(`${kind.toUpperCase()} ${mb} MB sınırını aşıyor.`, 'error');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      show('Oturum bulunamadı. Giriş yapın.', 'error');
      return;
    }

    setUploadingFile(true);

    try {
      const code = (watch('code') ?? '').trim() || `product-${Date.now()}`;
      const res: UploadResult =
        kind === 'pdf'
          ? await uploadProductPdfAndGetUrl(code, file)
          : await uploadProductImageAndGetUrl(code, file);

      // Not: PDF için image alanına yazmak istemiyorsan formda pdfUrl alanı aç.
      setValue('image', res.publicUrl, { shouldDirty: true, shouldValidate: true });
      setValue('file', file, { shouldDirty: true });

      setFileMeta({ name: file.name, kind });
      setUploadedRef({ bucket: res.bucket, path: res.path });

      show(`${file.name} yüklendi.`, 'success');
    } catch (err: unknown) {
      show(`Dosya yüklenemedi: ${describeError(err)}`, 'error');
      console.error('upload failed', err);
    } finally {
      setUploadingFile(false);
    }
  }

  const onSubmit: SubmitHandler<CreateValues> = async (v) => {
    try {
      await createProduct({
        name: v.name,
        code: v.code,
        variant: v.variant,
        category: v.category,
        subCategory: v.subCategory,
        unitWeightG: v.unitWeightG, // gr/m
        date: v.date,
        drawer: v.drawer || undefined,
        control: v.control || undefined,
        scale: v.scale || undefined,
        outerSizeMm: v.outerSizeMm ?? undefined,
        sectionMm2: v.sectionMm2 ?? undefined,
        tempCode: v.tempCode ?? null,
        profileCode: v.profileCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: v.image || null,
        file: v.file ?? null,
      });

      show('Ürün oluşturuldu.', 'success');
      router.push('/products');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      show(`Kayıt başarısız: ${msg}`, 'error');
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* GENEL BİLGİLER */}
          <FormSection title="Genel Bilgiler">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Tam Ad (name)"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Kod"
                fullWidth
                {...register('code')}
                error={!!errors.code}
                helperText={errors.code?.message}
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
                    helperText={errors.variant?.message}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) => {
                        const val = String(v ?? '');
                        if (!val) return 'Seçiniz';
                        const found = variants.find(x => x.key === val)?.name;
                        return found ?? val;
                      },
                    }}
                  >
                    <MenuItem value=""><em>Seçiniz</em></MenuItem>
                    {variants.map(v => (
                      <MenuItem key={v.key} value={v.key}>{v.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

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
                      const val = (e.target as HTMLInputElement).value;
                      field.onChange(val);
                      setValue('subCategory', '', { shouldValidate: true, shouldDirty: true });
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
                    helperText={errors.category?.message}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {categoryOptions.map(c => (
                      <MenuItem key={c.slug} value={c.slug}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

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
                      const cat = watch('category');
                      if (!cat && val) {
                        const owner = findOwnerCategory(val);
                        if (owner) {
                          setValue('category', owner, { shouldValidate: true, shouldDirty: true });
                        }
                      }
                    }}
                    error={!!errors.subCategory}
                    helperText={errors.subCategory?.message}
                  >
                    <MenuItem value="">{watchedCategory ? 'Seçiniz' : 'Bir alt kategori seçin'}</MenuItem>
                    {getSubCatsFor(watchedCategory).map(sc => (
                      <MenuItem key={sc.slug} value={sc.slug}>{sc.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Tarih"
                type="date"
                fullWidth
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </FormSection>

          {/* TEKNİK ÖZELLİKLER */}
          <FormSection title="Teknik Özellikler">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Çizen" fullWidth {...register('drawer')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Kontrol" fullWidth {...register('control')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Ölçek" fullWidth {...register('scale')} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField<CreateValues, 'unitWeightG'>
                name="unitWeightG"
                label="Birim Ağırlık"
                integer
                endAdornmentText="gr/m"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField<CreateValues, 'outerSizeMm'>
                name="outerSizeMm"
                label="Dış Çevre"
                endAdornmentText="mm"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField<CreateValues, 'sectionMm2'>
                name="sectionMm2"
                label="Kesit"
                endAdornmentText="mm²"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Geçici Kod" fullWidth {...register('tempCode')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Profil Kodu" fullWidth {...register('profileCode')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Üretici Kodu" fullWidth {...register('manufacturerCode')} />
            </Grid>
          </FormSection>

          {/* DOSYA */}
          <FormSection title="Dosya" hideDivider>
            <Grid size={{ xs: 12 }}>
              <Box>
                <input
                  id="file-input"
                  type="file"
                  accept="application/pdf,image/png,image/webp,image/jpeg"
                  hidden
                  onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                />
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-start">
                  <Button
                    variant="outlined"
                    startIcon={fileMeta?.kind === 'pdf' ? <PictureAsPdfIcon /> : <ImageIcon />}
                    component="label"
                    htmlFor="file-input"
                    disabled={uploadingFile || isSubmitting}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {uploadingFile ? 'Yükleniyor…' : 'Dosya Seç ve Yükle'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteOpen(true)}
                    disabled={!uploadedRef || uploadingFile || isSubmitting}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    Sil
                  </Button>

                  <Box sx={{ textAlign: 'right', opacity: 0.8, fontSize: 13 }}>
                    {fileMeta
                      ? `${fileMeta.name} yüklendi (${fileMeta.kind.toUpperCase()})`
                      : (watch('image') ? 'Dosya yüklü' : 'Dosya seçilmedi')}
                  </Box>
                </Stack>

                {errors.image && <FormHelperText error>{errors.image.message}</FormHelperText>}
              </Box>
            </Grid>
          </FormSection>

          {/* Aksiyonlar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
            <Button variant="outlined" onClick={() => history.back()} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty || !isValid || isSubmitting}>
              Kaydet
            </Button>
          </Box>
        </Box>
      </FormProvider>

      <ConfirmDialog
        open={deleteOpen}
        title="Dosyayı sil"
        description="Yüklediğiniz dosyayı sunucudan kaldırmak ve formdan temizlemek istiyor musunuz?"
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            if (uploadedRef) {
              await removeUploaded(uploadedRef);
            }
            setValue('image', '', { shouldDirty: true, shouldValidate: true });
            setValue('file', null, { shouldDirty: true });
            setFileMeta(null);
            setUploadedRef(null);

            show('Dosya silindi.', 'success');
          } catch (err) {
            show(`Silinemedi: ${describeError(err)}`, 'error');
          } finally {
            setDeleteOpen(false);
          }
        }}
      />

    </Paper>
  );
}
