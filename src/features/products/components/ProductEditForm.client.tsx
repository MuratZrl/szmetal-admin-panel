'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Box,
  Stack,
  FormHelperText,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, Controller, type SubmitHandler, type Resolver } from 'react-hook-form';

import { supabase } from '@/lib/supabase/supabaseClient';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

import type { ProductDicts } from '@/features/products/services/dicts.server';
import { updateProduct, type UpdateProductInput } from '@/features/products/services/products.client';

import {
  STORAGE_BUCKET,
  type UploadResult,
  type UploadRef,
  uploadProductPdfAndGetUrl,
  uploadProductImageAndGetUrl,
  removeUploaded,
} from '@/features/products/services/storage.client';

import FormSection from '@/features/products/components/form/FormSection';
import NumberField from '@/features/products/components/form/NumberField';
import { productSchema, type ProductFormValues } from '@/features/products/forms/schema';
import { buildCategoryHelpers } from '@/features/products/forms/helpers';

// Edit formu: ortak form modeline küçük eklemeler
type EditValues = ProductFormValues & {
  id: string;
  file: File | null;
};

type Props = {
  dicts: ProductDicts;
  initial: {
    id: string;
    name: string;
    code: string;
    variant: string;
    category: string;
    subCategory: string;
    unitWeightG: number | null;
    date: string;
    drawer?: string | null;
    control?: string | null;
    scale?: string | null;
    outerSizeMm?: number | null;
    sectionMm2?: number | null;
    tempCode?: string | null;
    profileCode?: string | null;
    manufacturerCode?: string | null;
    image?: string | null;
  };
};

function inferImagePathFromUrl(url: string, code: string): string | null {
  try {
    const u = new URL(url);
    const p = u.pathname; // /storage/v1/object/public/product-media/images/ABC/main.jpg
    const idx = p.indexOf('/images/');
    if (idx === -1) return null;
    const after = p.slice(idx + 1); // images/ABC/main.jpg
    const expect = `images/${code}/main.`;
    if (!after.startsWith(expect)) return null;
    return after; // bucket içi path
  } catch {
    return null;
  }
}

export default function ProductEditForm({ dicts, initial }: Props) {
  const router = useRouter();
  const { show } = useSnackbar();

  // RHF default’ları
  const defaultValues = React.useMemo<EditValues>(() => ({
    id: initial.id,
    name: initial.name ?? '',
    code: initial.code ?? '',
    variant: initial.variant ?? '',
    category: initial.category ?? '',
    subCategory: initial.subCategory ?? '',
    unitWeightG: typeof initial.unitWeightG === 'number' ? Math.round(initial.unitWeightG) : 0,
    date: initial.date ?? new Date().toISOString().slice(0, 10),
    drawer: initial.drawer ?? '',
    control: initial.control ?? '',
    scale: initial.scale ?? '',
    outerSizeMm: initial.outerSizeMm ?? null,
    sectionMm2: initial.sectionMm2 ?? null,
    tempCode: initial.tempCode ?? null,
    profileCode: initial.profileCode ?? null,
    manufacturerCode: initial.manufacturerCode ?? null,
    image: initial.image ?? '',
    file: null,
  }), [initial]);

  const methods = useForm<EditValues>({
    resolver: yupResolver(productSchema) as unknown as Resolver<EditValues>,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const { control, register, handleSubmit, formState, watch, setValue, getValues, reset } = methods;
  const { errors, isSubmitting, isDirty, isValid } = formState;

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Dicts → yardımcılar
  const variants = dicts?.variants ?? [];
  
  const { categoryOptions, getSubCatsFor, categoryLabelMap, subLabelMap, findOwnerCategory } =
    React.useMemo(() => buildCategoryHelpers(dicts?.categoryTree), [dicts]);

  // YENİ: initial.image varsa ve kuralımıza uyuyorsa referans hazır
  const initialImageRef = React.useMemo<UploadRef | null>(() => {
    if (!initial.image) return null;
    const path = inferImagePathFromUrl(initial.image, initial.code ?? '');
    return path ? { bucket: STORAGE_BUCKET, path } : null;
  }, [initial.image, initial.code]);

  const watchedCategory = watch('category');

  // Upload state
  const [uploadingFile, setUploadingFile] = React.useState(false);
  
  const [fileMeta, setFileMeta] =
    React.useState<{ name: string; kind: 'pdf' | 'image' } | null>(null);

  // YENİ: bu edit oturumunda yüklenen “yeni” dosya referansı
  const [uploadedRef, setUploadedRef] = React.useState<UploadRef | null>(null);

  // YENİ: mevcut (kayıtlı) dosyayı kayıttan sonra silmek üzere işaretle
  const [, setPendingDeleteRef] = React.useState<UploadRef | null>(null);

  // YENİ: Sil onay diyaloğu
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
      // Aynı edit oturumunda ardışık yüklemelerde eskiyi çöpe at
      if (uploadedRef) {
        try {
          await removeUploaded(uploadedRef);
        } catch {
          // sessiz geç; yeni upload öncelik
        } finally {
          setUploadedRef(null);
        }
      }

      const code = watch('code')?.trim() || `product-${Date.now()}`;
      
      const res: UploadResult =
        kind === 'pdf'
          ? await uploadProductPdfAndGetUrl(code, file)
          : await uploadProductImageAndGetUrl(code, file);

      // Not: formunda image alanına daima “güncel dosyanın publicUrl”’ini yazıyorsun
      setValue('image', res.publicUrl, { shouldDirty: true, shouldValidate: true });
      setValue('file', file, { shouldDirty: true });

      setFileMeta({ name: file.name, kind });
      setUploadedRef({ bucket: res.bucket, path: res.path });

      // Eski kayıtlı dosyayı otomatik silme.
      // Kullanıcı isterse Sil diyerek kaldırır, biz de pendingDeleteRef ile Kaydet’te temizleriz.
      show(`${file.name} yüklendi.`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      show(`Dosya yüklenemedi: ${msg}`, 'error');
    } finally {
      setUploadingFile(false);
    }
  }

  // Submit
  const onSubmit: SubmitHandler<EditValues> = async (v) => {
    try {
      await updateProduct(Number(v.id), {
        name: v.name,
        code: v.code,
        variant: v.variant,
        category: v.category,
        subCategory: v.subCategory,
        unitWeightG: v.unitWeightG,
        date: v.date,
        drawer: v.drawer || null,
        control: v.control || null,
        scale: v.scale || null,
        outerSizeMm: v.outerSizeMm ?? null,
        sectionMm2: v.sectionMm2 ?? null,
        tempCode: v.tempCode ?? null,
        profileCode: v.profileCode ?? null,
        manufacturerCode: v.manufacturerCode ?? null,
        image: v.image || null,
      } satisfies UpdateProductInput);

      show('Ürün güncellendi.', 'success');
      router.push('/products');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      show(`Güncelleme başarısız: ${msg}`, 'error');
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

                      // kategori boş ise, alt kategori sahibini bul ve set et
                      const cat = getValues('category');
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
              <NumberField<EditValues, 'unitWeightG'>
                name="unitWeightG"
                label="Birim Ağırlık"
                integer
                endAdornmentText="gr/m"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField<EditValues, 'outerSizeMm'>
                name="outerSizeMm"
                label="Dış Çevre"
                endAdornmentText="mm"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <NumberField<EditValues, 'sectionMm2'>
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
                    disabled={(!uploadedRef && !watch('image')) || uploadingFile || isSubmitting}
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
        title="Dosyayı kaldır"
        description={uploadedRef
          ? 'Yüklediğiniz dosyayı sunucudan silmek ve formdan kaldırmak istiyor musunuz?'
          : 'Mevcut dosyayı formdan kaldırmak istiyor musunuz? Kaydettiğinizde depodan da sileceğiz.'}
        confirmText={uploadedRef ? 'Evet, sil' : 'Evet, kaldır'}
        cancelText="Vazgeç"
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            if (uploadedRef) {
              // Bu oturumda yeni yüklenen dosyayı anında sil
              await removeUploaded(uploadedRef);
              setUploadedRef(null);
              setFileMeta(null);
              setValue('file', null, { shouldDirty: true });
              setValue('image', '', { shouldDirty: true, shouldValidate: true });
              show('Dosya silindi.', 'success');
            } else {
              // Kayıtlı dosyayı formdan kaldır; depodan silmeyi kaydetten sonra yap
              if (initialImageRef) setPendingDeleteRef(initialImageRef);
              setFileMeta(null);
              setValue('file', null, { shouldDirty: true });
              setValue('image', '', { shouldDirty: true, shouldValidate: true });
              show('Dosya kaldırıldı. Kaydedince depodan da silinecek.', 'success');
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            show(`Silinemedi: ${msg}`, 'error');
          } finally {
            setDeleteOpen(false);
          }
        }}
      />


    </Paper>
  );
}
