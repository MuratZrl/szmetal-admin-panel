// app/(admin)/_components_/ui/dialogs/AddProductDialog.tsx

'use client';

import Image from 'next/image';

import { useState, useEffect, ChangeEvent } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { productDialogSchema } from '../../../_constants_/form-validations/productDialogSchemas';

import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack
} from '@mui/material';

import { commonTextFieldProps } from '../../../_constants_/formstyles';

import { useForm, Controller } from 'react-hook-form';

import type { FormValues, AddProductDialogProps } from '../../../types/addproductsTypes';

import { supabase } from '../../../../lib/supabaseClient';

export default function AddProductDialog({
    open,
    onClose,
    slug,
    table,
    onSuccess,
  }: AddProductDialogProps) {

  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(productDialogSchema),
    defaultValues: {
      profil_kodu: '',
      profil_adi: '',
      profil_resmi: '',
      birim_agirlik: 0,
    },
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${slug}/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images') // 🔁 Bucket adı
      .upload(filePath, file);

    if (error) {
      console.error('Upload hatası:', error.message);
    } else {
      const publicUrl = supabase
        .storage
        .from('product-images')
        .getPublicUrl(filePath).data.publicUrl;

      setValue('profil_resmi', publicUrl); // Form içine yaz
    }

    setUploading(false);
  };

  const onSubmit = async (data: FormValues) => {
    const { error } = await supabase
      .from(table) // ✅ tablo adı artık burada
      .insert([{ ...data, system_slug: slug }]); // 🔑 system_slug ilişkisi kurulmalı

    if (!error) {
      onSuccess();
      reset();
      onClose();
    } else {
      console.error('Ekleme hatası:', error.message);
    }
  };

  // ******************************************************************************************

  // useEffect hook'ları
  useEffect(() => {
    if (open) {
      reset({
        profil_kodu: '',
        profil_adi: '',
        profil_resmi: '',
        birim_agirlik: 0,
      });
    }
  }, [open, reset]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth   
      PaperProps={{
        sx: {
          borderRadius: 4, // istediğin radius
        },
      }}
    >

      <DialogTitle variant='h6'>Yeni Kayıt</DialogTitle>

      {/* ****************************************************************************************** */}

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>

          <Stack spacing={2} mt={1} >

            {/* ****************************************************************************************** */}

            
            <Button 
              variant="contained" 
              component="label" 
              disabled={uploading}
              sx={{ py: 1.5, backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }} 
            >
              {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} /> {/* ✅ burada olmalı */}
            </Button>

            {/* ****************************************************************************************** */}

            {watch('profil_resmi') && (
              <Box 
                sx={{ width: '100%', height: 300, position: 'relative', borderRadius: 1, overflow: 'hidden' }}
                onContextMenu={(e) => e.preventDefault()} // ✅ Sağ tık engeli
              >
                <Image
                  draggable={false}
                  src={watch('profil_resmi')}
                  alt="Profil"
                  fill
                  style={{
                    objectFit: 'cover', pointerEvents: 'none',
                  }}
                />
              </Box>
            )}

            {/* ****************************************************************************************** */}

            <Controller
              name="profil_kodu"
              control={control}
              render={({ field }) => (

                <TextField
                  required
                  label="Profil Kodu"
                  fullWidth
                  {...field}
                  {...commonTextFieldProps}
                  error={!!errors.profil_kodu}
                  helperText={errors.profil_kodu?.message}
                />

              )}
            />

            {/* ****************************************************************************************** */}

            <Controller
              name="profil_adi"
              control={control}
              render={({ field }) => (

                <TextField
                  required
                  label="Profil Adı"
                  fullWidth
                  {...field}
                  {...commonTextFieldProps}
                  error={!!errors.profil_adi}
                  helperText={errors.profil_adi?.message}
                />

              )}
            />

            {/* ****************************************************************************************** */}

            <Controller
              name="birim_agirlik"
              control={control}
              render={({ field }) => (

                <TextField
                  required
                  label="Birim Ağırlık (kg/m)"
                  type="number"
                  fullWidth
                  {...field}
                  {...commonTextFieldProps}
                  error={!!errors.birim_agirlik}
                  helperText={errors.birim_agirlik?.message}
                />

              )}
            />

            {/* ****************************************************************************************** */}

            <DialogActions>

              <Button 
                onClick={onClose}
                sx={{ color: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
              >
                İptal
              </Button>

              <Button 
                type="submit" 
                variant="contained" 
                disabled={uploading || !isValid} // 🔒 sadece form geçerliyse ve yükleme yapılmıyorsa aktif
                sx={{ px: 4, backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
              >
                Ekle
              </Button>

            </DialogActions>

            {/* ****************************************************************************************** */}

          </Stack>

        </form>
      </DialogContent>

    </Dialog>
  );
}
