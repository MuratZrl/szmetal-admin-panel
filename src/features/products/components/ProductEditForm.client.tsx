// src/features/products/components/ProductEditForm.client.tsx
'use client';

import * as React from 'react';
import { Grid, Stack, TextField, MenuItem, Button, Paper, Box, FormHelperText } from '@mui/material';
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { supabase } from '@/lib/supabase/supabaseClient';

import { useDeepCompareMemo } from 'use-deep-compare';

// --- yardımcı
const toNullNumberOptional = () =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || Number.isNaN(v) ? null : v))
    .nullable()
    .optional()
    .default(null)
    .min(0, 'Negatif olamaz');


// Şema factory: kategoriler/variantlar dışarıdan gelir
const makeProductSchema = (
  categories: string[],
  variants: string[],
  categoryTree: Record<string, string[]>
) => yup.object({
  displayName: yup.string().required('Zorunlu'),
  name: yup.string().required('Zorunlu'),
  code: yup.string().required('Zorunlu'),

  variant: yup.string().oneOf(variants, 'Geçersiz varyant').required('Zorunlu'),
  category: yup.string().oneOf(categories, 'Geçersiz kategori').required('Zorunlu'),
  subCategory: yup
    .string()
    .test('sub-in-cat', 'Geçersiz alt kategori', function (value) {
      const cat = this.parent.category as string | undefined;
      if (!cat || !value) return false;
      const subs = categoryTree[cat] ?? [];
      return subs.includes(value);
    })
    .required('Zorunlu'),

  unitWeightKg: yup.number().typeError('Sayı gir').min(0).required('Zorunlu'),
  date: yup.string().required('Zorunlu'),

  // Burada .defined() kullanıyoruz ki tip saf string olsun
  drawer: yup.string().default('').defined(),
  control: yup.string().default('').defined(),
  scale: yup.string().default('').defined(),

  outerSizeMm: toNullNumberOptional(),
  sectionMm2: toNullNumberOptional(),
  unitWeightGrPerM: toNullNumberOptional(),

  tempCode: yup.string().default('').defined(),
  profileCode: yup.string().default('').defined(),
  manufacturerCode: yup.string().default('').defined(),

  image: yup.string().url('Geçersiz URL').required('Zorunlu'),
});

// ← Tipi şemadan türet
export type ProductEditValues = yup.InferType<ReturnType<typeof makeProductSchema>>;

export default function ProductEditForm({
  initial,
  onSave,
  categories,
  variants,
  categoryTree,
}: {
  initial: ProductEditValues;
  onSave: (values: ProductEditValues) => Promise<void>;
  categories: string[];
  variants: string[];
  categoryTree: Record<string, string[]>;
}) {

  const [uploading, setUploading] = React.useState(false);
  const [pdfName, setPdfName] = React.useState<string | null>(null);

  // Şemayı oluştur
  const schema = useDeepCompareMemo(
    () => makeProductSchema(categories, variants, categoryTree),
    [categories, variants, categoryTree]
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setValue,
  } = useForm<ProductEditValues>({
    // Resolver tipi artık ProductEditValues ile birebir
    resolver: yupResolver(schema) as Resolver<ProductEditValues>,
    defaultValues: initial,
    mode: 'onChange',
  });

  const category = watch('category');
  const subs = categoryTree[category] ?? [];

  async function handlePdfPick(file?: File | null) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      // kibar uyarı; Yup zaten yakalayacak ama anında da söyleyelim
      alert('Sadece PDF yükleyin.');
      return;
    }
    setUploading(true);
    try {
      // path: pdf/<kod veya id>/<timestamp-uuid>.pdf
      const base = String(initial?.code ?? 'product');
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
      // Formdaki image alanına public URL yazıyoruz ki mevcut şemayı bozmayalım
      setValue('image', data.publicUrl, { shouldDirty: true, shouldValidate: true });
      setPdfName(file.name);
    } catch (err) {
      console.error(err);
      alert('PDF yüklenemedi. Bucket ve RLS izinlerini kontrol edin.');
    } finally {
      setUploading(false);
    }
  }

  React.useEffect(() => {
    const current = watch('subCategory');
    if (!subs.includes(current)) {
      setValue('subCategory', subs[0] ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subs.length]);

  const onSubmit: SubmitHandler<ProductEditValues> = async (values) => {
    await onSave(values);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box
        component={'form'}
        onSubmit={handleSubmit(onSubmit)}  // ← burada biter
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="İsim (display)"
              fullWidth
              {...register('displayName')}
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Ad (name)"
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
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Varyant"
                  fullWidth
                  {...field} // value, onChange hazır
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {variants.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState }) => (
                <TextField select label="Kategori" fullWidth {...field}
                  error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="subCategory"
              control={control}
              render={({ field, fieldState }) => (
                <TextField select label="Alt Kategori" fullWidth {...field}
                  error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {(categoryTree[field.value ? watch('category') : watch('category')] ?? [])
                    .map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Birim Ağırlık (kg)"
              type="number"
              inputProps={{ step: '0.01' }}
              fullWidth
              {...register('unitWeightKg', { valueAsNumber: true })}
              error={!!errors.unitWeightKg}
              helperText={errors.unitWeightKg?.message}
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
            <TextField
              label="Dış Çevre (mm)"
              type="number"
              fullWidth
              {...register('outerSizeMm', { valueAsNumber: true })}
              error={!!errors.outerSizeMm}
              helperText={errors.outerSizeMm?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Kesit (mm²)"
              type="number"
              fullWidth
              {...register('sectionMm2', { valueAsNumber: true })}
              error={!!errors.sectionMm2}
              helperText={errors.sectionMm2?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Birim Ağırlığı (gr/m)"
              type="number"
              fullWidth
              {...register('unitWeightGrPerM', { valueAsNumber: true })}
              error={!!errors.unitWeightGrPerM}
              helperText={errors.unitWeightGrPerM?.message}
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
                  component="label"
                  htmlFor="pdf-input"
                  disabled={uploading}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {uploading ? 'Yükleniyor…' : 'PDF Seç ve Yükle'}
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

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="text"
                onClick={(e) => {
                  e.preventDefault();
                  if (history.length > 1) history.back();
                }}
                sx={{ textTransform: 'capitalize' }}
              >
                İptal
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty} sx={{ textTransform: 'capitalize' }}>
                Kaydet
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
