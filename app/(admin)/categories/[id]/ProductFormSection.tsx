'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import productFormSchema, {
  ProductFormValues,
  defaultProductFormValues,
} from '../../_constants_/form-validations/categoryProductSchemas'; // aynı klasördeki schema dosyası

import { supabase } from '../../../lib/supabase/supabaseClient';

type Props = {
  id: string;
};

export default function ProductFormSection({ id }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'info'; message: string }>({
    open: false,
    severity: 'info',
    message: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `drawer, controller, date, revision, scale, outer_env, section, unit_weight, name, customer, customer_approval_date, temp_code, profile_code, manufacturer_code`
          )
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          if (data) {
            // DB -> form tip eşleştirmesi
            const mapped: Partial<ProductFormValues> = {
              drawer: data.drawer ?? null,
              controller: data.controller ?? null,
              date: data.date ?? null,
              revision: data.revision ?? null,
              scale: data.scale ?? null,
              outer_env: data.outer_env ?? null,
              section: data.section ?? null,
              // unit_weight DB'de number veya string olabilir, schema nullableNumber işliyor
              unit_weight: data.unit_weight ?? null,
              name: data.name ?? null,
              customer: data.customer ?? null,
              customer_approval_date: data.customer_approval_date ?? null,
              temp_code: data.temp_code ?? null,
              profile_code: data.profile_code ?? null,
              manufacturer_code: data.manufacturer_code ?? null,
            };
            reset(mapped as ProductFormValues, { keepDefaultValues: true });
          } else {
            reset(defaultProductFormValues);
          }
        }
      } catch {
        setSnack({ open: true, severity: 'error', message: 'Ürün yüklenirken hata oluştu' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setSnack((s) => ({ ...s, open: false }));
    setLoading(true);

    try {
      // payload: null'ları açıkça set et
      const payload = {
        drawer: values.drawer ?? null,
        controller: values.controller ?? null,
        date: values.date ?? null,
        revision: values.revision ?? null,
        scale: values.scale ?? null,
        outer_env: values.outer_env ?? null,
        section: values.section ?? null,
        unit_weight: values.unit_weight ?? null,
        name: values.name ?? null,
        customer: values.customer ?? null,
        customer_approval_date: values.customer_approval_date ?? null,
        temp_code: values.temp_code ?? null,
        profile_code: values.profile_code ?? null,
        manufacturer_code: values.manufacturer_code ?? null,
      };

      const { error } = await supabase.from('products').update(payload).eq('id', id);

      if (error) throw error;

      setSnack({ open: true, severity: 'success', message: 'Ürün başarıyla güncellendi.' });
      // update sonrası form dirty flag'ini temizle
      reset(payload as ProductFormValues);
    } catch {
      setSnack({ open: true, severity: 'error', message: 'Güncelleme sırasında hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ürün Bilgileri
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Çizen" fullWidth {...register('drawer')} error={!!errors.drawer} helperText={errors.drawer?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Kontrol" fullWidth {...register('controller')} error={!!errors.controller} helperText={errors.controller?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Tarih" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('date')} error={!!errors.date} helperText={errors.date?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Tadilat" fullWidth {...register('revision')} error={!!errors.revision} helperText={errors.revision?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Ölçek" fullWidth {...register('scale')} error={!!errors.scale} helperText={errors.scale?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Dış Çevre" fullWidth {...register('outer_env')} error={!!errors.outer_env} helperText={errors.outer_env?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Kesit" fullWidth {...register('section')} error={!!errors.section} helperText={errors.section?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField
              label="Birim Ağırlık"
              fullWidth
              type="number"
              inputProps={{ step: 'any', min: 0 }}
              {...register('unit_weight')}
              error={!!errors.unit_weight}
              helperText={errors.unit_weight?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="İsim" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Müşteri" fullWidth {...register('customer')} error={!!errors.customer} helperText={errors.customer?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField
              label="Müşteri Onay Tarihi"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('customer_approval_date')}
              error={!!errors.customer_approval_date}
              helperText={errors.customer_approval_date?.message}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Geçici Kodu" fullWidth {...register('temp_code')} error={!!errors.temp_code} helperText={errors.temp_code?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Profil Kodu" fullWidth {...register('profile_code')} error={!!errors.profile_code} helperText={errors.profile_code?.message} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }} >
            <TextField label="Üretici Kodu" fullWidth {...register('manufacturer_code')} error={!!errors.manufacturer_code} helperText={errors.manufacturer_code?.message} />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => reset()}
            disabled={isSubmitting || loading}
          >
            Geri Al
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting || loading || !isDirty}>
            {isSubmitting || loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
