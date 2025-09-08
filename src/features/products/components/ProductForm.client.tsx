// src/features/products/components/ProductForm.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Box, Grid, TextField, MenuItem, Button, Stack, FormHelperText, Typography, Divider } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

import { useForm, Controller, type SubmitHandler, type Resolver } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { ProductDicts } from '@/features/products/dicts.server';
import { createProduct } from '@/features/products/services/products.client';

import {
  uploadProductPdfAndGetUrl,
  uploadProductImageAndGetUrl,
} from '@/features/products/services/storage.client';

import { supabase } from '@/lib/supabase/supabaseClient';

// ✅ EKLE
import { useSnackbar } from '@/components/ui/snackbar/useSnackbar.client';

type Props = { dicts: ProductDicts };

const toNullNumber = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .min(0, '0 veya daha büyük olmalı');

// Şema: yeni alanlar eklendi
const schema = yup
  .object({
    name: yup.string().required('Zorunlu'),
    code: yup.string().required('Zorunlu'),

    variant: yup.string().required('Zorunlu').min(1, 'Zorunlu'),
    category: yup.string().required('Zorunlu').min(1, 'Zorunlu'),
    subCategory: yup.string().required('Zorunlu').min(1, 'Zorunlu'),

    unitWeightKg: toNullNumber(),
    date: yup.string().required('Zorunlu'),

    drawer: yup.string().default('').defined(),
    control: yup.string().default('').defined(),
    scale: yup.string().default('').defined(),

    outerSizeMm: toNullNumber(),
    sectionMm2: toNullNumber(),

  // ↓↓↓ sadece bu üç satırı değiştir
  profileCode: yup
    .string()
    .optional()
    .nullable()
    .transform((v, orig) => (orig === '' ? null : (v?.trim() ?? null))),

  tempCode: yup
    .string()
    .optional()
    .nullable()
    .transform((v, orig) => (orig === '' ? null : (v?.trim() ?? null))),

  manufacturerCode: yup
    .string()
    .optional()
    .nullable()
    .transform((v, orig) => (orig === '' ? null : (v?.trim() ?? null))),

    // PDF public URL’si burada tutulacak. Boş olabilir ama URL ise geçerli olmalı.
    image: yup
      .string()
      .trim()
      .test('url-or-empty', 'Geçersiz URL', v => !v || /^https?:\/\/.+/i.test(v))
      .default('')
      .defined(),
  })
  .required();

export type FormValues = yup.InferType<typeof schema>;

export default function ProductForm({ dicts }: Props) {
  const router = useRouter();
  const { show } = useSnackbar(); // ✅

  // Güvenli defaultValues
  const defaultValues = React.useMemo<FormValues>(() => {
    return {
      name: '',
      code: '',

      variant: '',
      category: '',
      subCategory: '',

      unitWeightKg: null,
      date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd

      drawer: '',
      control: '',
      scale: '',

      outerSizeMm: null,
      sectionMm2: null,

      tempCode: '',
      profileCode: '',
      manufacturerCode: '',

      image: '', // PDF public URL burada
      file: null,
    };
  }, []);
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues,
  });

  const watchedCategory = watch('category');

  // isimli parent seçenekleri
  const categoryOptions = React.useMemo(
    () => Object.entries(dicts.categoryTree ?? {}).map(([slug, node]) => ({ slug, name: node.name })),
    [dicts.categoryTree]
  );

  const allSubCats = React.useMemo(
    () => {
      const arr = Object.values(dicts.categoryTree ?? {}).flatMap(node =>
        node.subs.map(s => ({ slug: s.slug, name: s.name }))
      );
      // unique by slug
      const map = new Map(arr.map(s => [s.slug, s]));
      return Array.from(map.values());
    },
    [dicts.categoryTree]
  );

  const subCatsForSelected = React.useMemo(() => {
    const cat = watchedCategory;
    if (cat && dicts.categoryTree?.[cat]) return dicts.categoryTree[cat].subs;
    return allSubCats;
  }, [watchedCategory, dicts.categoryTree, allSubCats]);


  // Parent kategori: slug -> name
  const categoryLabelMap = React.useMemo(() => {
    const m = new Map<string, string>();
    Object.entries(dicts.categoryTree ?? {}).forEach(([slug, node]) => m.set(slug, node.name));
    return m;
  }, [dicts.categoryTree]);


  // Alt kategori: slug -> name (tüm altlar, unique)
  const subLabelMap = React.useMemo(() => {
    const m = new Map<string, string>();
    Object.values(dicts.categoryTree ?? {}).forEach(node => {
      node.subs.forEach(s => m.set(s.slug, s.name));
    });
    return m;
  }, [dicts.categoryTree]);

  // dicts değişirse formu sıfırla (güvenli)
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // kategori değişince alt kategori boşalsın
  React.useEffect(() => {
    setValue('subCategory', '', { shouldValidate: true, shouldDirty: true });
  }, [watchedCategory, setValue]);

  // 🧩 state
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [fileMeta, setFileMeta] = React.useState<{ name: string; kind: 'pdf' | 'image' } | null>(null);

  // ✅ yalnızca istediğimiz MIME türleri
  const ACCEPTED_MIME: ReadonlySet<string> = new Set([
    'application/pdf',
    'image/png',
    'image/webp',
    'image/jpeg', // jpg de bu MIME ile gelir
  ]);

  // boyut sınırları (istersen tek limit de kullanabilirsin)
  const MAX_BYTES: Readonly<Record<'pdf' | 'image', number>> = {
    pdf: 10 * 1024 * 1024,    // 10 MB
    image: 8 * 1024 * 1024,   // 8 MB
  };

  function classify(file: File): 'pdf' | 'image' | null {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/') && ACCEPTED_MIME.has(file.type)) return 'image';
    return null;
  }

  // 🔁 PDF + Görsel için tek handler
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
      const code = watch('code')?.trim() || `product-${Date.now()}`;

      // türüne göre uygun servis
      let publicUrl: string;
      if (kind === 'pdf') {
        publicUrl = await uploadProductPdfAndGetUrl(code, file);
      } else {
        publicUrl = await uploadProductImageAndGetUrl(code, file); // 👈 bunu ekle
      }

      // Not: sende alan adı "image" ama PDF de gelebiliyor.
      // Daha temiz için formda assetUrl + assetType tutmayı düşün.
      setValue('image', publicUrl, { shouldDirty: true, shouldValidate: true });

      setFileMeta({ name: file.name, kind });
      show(`${file.name} yüklendi.`, 'success');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? String(err);
      show(`Dosya yüklenemedi: ${msg}`, 'error');
    } finally {
      setUploadingFile(false);
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // Not: createProduct servisinin parametre tipi bu alanlarla uyumlu olmalı.
    // Projede edit sayfasında zaten bu alanları kullanıyorsun, create tarafında da aynı yapıya getiriyoruz.
    try {
      await createProduct({
        name: values.name,
        code: values.code,

        variant: values.variant,
        category: values.category,
        subCategory: values.subCategory,

        unitWeightKg: values.unitWeightKg ?? undefined,
        date: values.date,

        drawer: values.drawer || undefined,
        control: values.control || undefined,
        scale: values.scale || undefined,

        outerSizeMm: values.outerSizeMm ?? undefined,
        sectionMm2: values.sectionMm2 ?? undefined,

        tempCode: values.tempCode ?? null,
        profileCode: values.profileCode ?? null,
        manufacturerCode: values.manufacturerCode ?? null,

        // PDF public URL
        image: values.image || null,

      } as Parameters<typeof createProduct>[0]); // tip güvenliği için ufak bir dokunuş

      show('Ürün oluşturuldu.', 'success'); // ✅
      router.push('/products');
      router.refresh();

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
      show(`Kayıt başarısız: ${msg}`, 'error'); // ✅
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} >

      <Box 
        component={'form'} 
        onSubmit={handleSubmit(onSubmit)}
      >
      
        <Grid container spacing={2} >

          {/* ===== Genel Bilgiler ===== */}
          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left" sx={{ my: 1.5 }}>
              <Typography variant="overline" fontStyle={'italic'} sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                Genel Bilgiler
              </Typography>
            </Divider>
          </Grid>
      
          {/* Ürün temel bilgileri */}
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

          {/* Varyant */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="variant"
              control={control}
              rules={{ required: 'Varyant zorunlu' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}     // undefined yerine boş string
                  onChange={(e) => field.onChange(e.target.value as string)}
                  select
                  label="Varyant"
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>

                  {dicts.variants.map(v => (
                    <MenuItem key={v.key} value={v.key}>
                      {v.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Kategori */}
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

          {/* Alt kategori */}
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

                    // Kategori seçilmemişken alt kategori seçilirse, otomatik kategori set et
                    const cat = watch('category');
                    if (!cat && val) {
                      const owner = Object.entries(dicts.categoryTree ?? {})
                        .find(([, node]) => node.subs.some(s => s.slug === val))?.[0];
                      if (owner) {
                        setValue('category', owner, { shouldValidate: true, shouldDirty: true });
                      }
                    }
                  }}
                  error={!!errors.subCategory}
                  helperText={errors.subCategory?.message}
                >

                  <MenuItem value="">{watchedCategory ? 'Seçiniz' : 'Bir alt kategori seçin'}</MenuItem>

                  {subCatsForSelected.map(sc => (
                    <MenuItem key={sc.slug} value={sc.slug}>{sc.name}</MenuItem>
                  ))}

                </TextField>
              )}
            />
          </Grid>

          {/* Tarih */}
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

          {/* ===== Teknik Özellikler ===== */}
          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left" sx={{ my: 1.5 }}>
              <Typography variant="overline" fontStyle={'italic'} sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                Teknik Özellikler
              </Typography>
            </Divider>
          </Grid>

          {/* Teknik alanlar */}
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
            <Controller
              name="unitWeightKg"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  inputMode="decimal"
                  inputProps={{ step: '0.001' }}
                  label="Birim Ağırlık (kg)"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? null : Number(v));
                  }}
                  error={!!errors.unitWeightKg}
                  helperText={errors.unitWeightKg?.message ?? (dicts.maxUnitWeightKg ? `Maks: ${dicts.maxUnitWeightKg}` : '')}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="outerSizeMm"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Dış Çevre (mm)"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? null : Number(v));
                  }}
                  error={!!errors.outerSizeMm}
                  helperText={errors.outerSizeMm?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="sectionMm2"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Kesit (mm²)"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? null : Number(v));
                  }}
                  error={!!errors.sectionMm2}
                  helperText={errors.sectionMm2?.message}
                />
              )}
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

          {/* SADECE PDF YÜKLEME */}
          <Grid size={{ xs: 12 }}>
            <Box>
              <input
                id="file-input"
                type="file"
                // accept sadece seçim filtresi. JPEG/JPG aynı MIME’dır.
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

                <Box sx={{ textAlign: 'right', opacity: 0.8, fontSize: 13 }}>
                  {fileMeta
                    ? `${fileMeta.name} yüklendi (${fileMeta.kind.toUpperCase()})`
                    : (watch('image') ? 'Dosya yüklü' : 'Dosya seçilmedi')}
                </Box>
              </Stack>

              {errors.image && <FormHelperText error>{errors.image.message}</FormHelperText>}
            </Box>
          </Grid>

          {/* Aksiyonlar */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
              variant="outlined"
                onClick={() => history.back()}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isDirty || !isValid || isSubmitting}
              >
                Kaydet
              </Button>
            </Stack>
          </Grid>
          
        </Grid>
      </Box>
    </Paper>
  );
}
