// src/features/products/components/ProductForm.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, TextField, MenuItem, Button, Stack, FormHelperText } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useForm, Controller, type SubmitHandler, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createProduct } from '../services/products.client';
import { supabase } from '@/lib/supabase/supabaseClient';

type CategoryTree = Record<string, string[]>;

type Dicts = {
  variants: string[];
  categoryTree: CategoryTree;
  maxUnitWeightKg?: number;
};

type Props = { dicts: Dicts };

const toNullNumber = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .min(0, '0 veya daha büyük olmalı');

// Şema: yeni alanlar eklendi
const schema = yup
  .object({
    displayName: yup.string().required('Zorunlu'),
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
    unitWeightGrPerM: toNullNumber(),

    tempCode: yup.string().default('').defined(),
    profileCode: yup.string().default('').defined(),
    manufacturerCode: yup.string().default('').defined(),

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

  // Güvenli defaultValues
  const defaultValues = React.useMemo<FormValues>(() => {
    return {
      displayName: '',
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
      unitWeightGrPerM: null,

      tempCode: '',
      profileCode: '',
      manufacturerCode: '',

      image: '', // PDF public URL burada
      file: null,
    };
  }, []);

  const allSubCats = React.useMemo(() => {
    const t = dicts.categoryTree ?? {};
    return Array.from(new Set(Object.values(t).flat()));
  }, [dicts.categoryTree]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues,
  });

  // dicts değişirse formu sıfırla (güvenli)
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedCategory = watch('category');

  // kategori değişince alt kategori boşalsın
  React.useEffect(() => {
    setValue('subCategory', '', { shouldValidate: true, shouldDirty: true });
  }, [watchedCategory, setValue]);

  // PDF upload durumu
  const [uploadingPdf, setUploadingPdf] = React.useState(false);
  const [pdfName, setPdfName] = React.useState<string | null>(null);

  // SADECE PDF kabul eden upload
  async function handlePdfPick(file?: File | null) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Sadece PDF yükleyin.');
      return;
    }
    setUploadingPdf(true);
    try {
      const code = watch('code')?.trim();
      const base = code || `product-${Date.now()}`;
      const fileName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
      const path = `pdf/${base}/${fileName}`;

      const { error } = await supabase
        .storage
        .from('product-media')
        .upload(path, file, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('product-media').getPublicUrl(path);
      setValue('image', data.publicUrl, { shouldDirty: true, shouldValidate: true });
      setPdfName(file.name);
    } catch (err) {
      console.error(err);
      alert('PDF yüklenemedi. Bucket ve RLS izinlerini kontrol edin.');
    } finally {
      setUploadingPdf(false);
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // Not: createProduct servisinin parametre tipi bu alanlarla uyumlu olmalı.
    // Projede edit sayfasında zaten bu alanları kullanıyorsun, create tarafında da aynı yapıya getiriyoruz.
    await createProduct({
      displayName: values.displayName,
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
      unitWeightGrPerM: values.unitWeightGrPerM ?? undefined,

      tempCode: values.tempCode || undefined,
      profileCode: values.profileCode || undefined,
      manufacturerCode: values.manufacturerCode || undefined,

      // PDF public URL
      image: values.image || null,

    } as Parameters<typeof createProduct>[0]); // tip güvenliği için ufak bir dokunuş

    router.push('/products');
    router.refresh();
  };

  const subCatsForSelected = React.useMemo(() => {
    const cat = watchedCategory;
    return cat ? (dicts.categoryTree?.[cat] ?? []) : allSubCats;
  }, [watchedCategory, dicts.categoryTree, allSubCats]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        {/* Ürün temel bilgileri */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Görünen Ad (display_name)"
            fullWidth
            {...register('displayName')}
            error={!!errors.displayName}
            helperText={errors.displayName?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="İç Ad (name)"
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
            render={({ field }) => (
              <TextField
                select
                label="Varyant"
                fullWidth
                {...field}
                value={field.value ?? ''}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: v => v ? String(v) : 'Seçiniz',
                }}
                error={!!errors.variant}
                helperText={errors.variant?.message}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {dicts.variants.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
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
                  field.onChange(e);
                  setValue('subCategory', '', { shouldValidate: true, shouldDirty: true });
                }}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: v => v ? String(v) : 'Seçiniz',
                }}
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {Object.keys(dicts.categoryTree ?? {}).map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
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
                  renderValue: v => v ? String(v) : 'Seçiniz',
                }}
                onChange={(e) => {
                  const val = e.target.value as string;
                  field.onChange(val);

                  // Kategori seçilmemişken alt kategori seçilirse, otomatik kategori set et
                  const cat = watch('category');
                  if (!cat && val) {
                    const owner = Object.entries(dicts.categoryTree ?? {})
                      .find(([, arr]) => arr.includes(val))?.[0];
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
                  <MenuItem key={sc} value={sc}>{sc}</MenuItem>
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

        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
          <Controller
            name="unitWeightGrPerM"
            control={control}
            render={({ field }) => (
              <TextField
                type="number"
                label="Birim Ağırlığı (gr/m)"
                fullWidth
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? null : Number(v));
                }}
                error={!!errors.unitWeightGrPerM}
                helperText={errors.unitWeightGrPerM?.message}
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
              id="pdf-input"
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => handlePdfPick(e.target.files?.[0] ?? null)}
            />
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                component="label"
                htmlFor="pdf-input"
                disabled={uploadingPdf || isSubmitting}
                sx={{ textTransform: 'capitalize' }}
              >
                {uploadingPdf ? 'Yükleniyor…' : 'PDF Seç ve Yükle'}
              </Button>
              <Box sx={{ flex: 1, textAlign: 'right', opacity: 0.8, fontSize: 13 }}>
                {pdfName
                  ? `${pdfName} yüklendi`
                  : (watch('image') ? 'PDF yüklü' : 'PDF seçilmedi')}
              </Box>
            </Stack>

            {errors.image && (
              <FormHelperText error>{errors.image.message}</FormHelperText>
            )}
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
  );
}
