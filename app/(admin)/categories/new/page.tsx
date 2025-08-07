'use client';

import { useState } from 'react';

import { Box, Button, Card, Stack, Typography, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

import { commonTextFieldProps } from '../../_constants_/formstyles';

import { supabase } from '../../../lib/supabase/supabaseClient';

type FormValues = {
  title: string;
  description: string;
  image: FileList;
};


function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-')     // Boşlukları tireye çevir
    .replace(/--+/g, '-');    // Çift tireleri teke indir
}

export default function NewCategoryForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    const file = data.image[0];
    const fileName = `${Date.now()}-${file.name}`;

    // 1. Supabase Storage’a görseli yükle
    const { error: storageError } = await supabase.storage
      .from('categories') // Bucket adı
      .upload(fileName, file);

    if (storageError) {
      console.error('Görsel yüklenemedi:', storageError.message);
      return;
    }

    // 2. Yüklenen görselin public URL’sini oluştur
    const imageUrl = supabase.storage
      .from('categories')
      .getPublicUrl(fileName).data.publicUrl;

    // 3. Veriyi Supabase tablosuna ekle
    const { error: insertError } = await supabase.from('categories').insert([
      {
        title: data.title,
        description: data.description,
        image: imageUrl,
        slug: generateSlug(data.title),
      },
    ]);

    if (insertError) {
      console.error('Kategori eklenemedi:', insertError.message);
      return;
    }

    // Başarılıysa yönlendir
    window.location.href = '/categories';
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 max-w-xl mx-auto"
      noValidate
      autoComplete="off"
    >

      <Card sx={{ p: 3, borderRadius: 7 }} >
        <Stack spacing={2}>

          <Typography
            variant='h5'
          >
            Sistem Kategorisi Ekle
          </Typography>

          <TextField
            label="Başlık"

            {...register('title', { required: true })}
            
            {...commonTextFieldProps}
          />
          <TextField
            label="Açıklama"
            multiline
            rows={3}

            {...register('description')}

            {...commonTextFieldProps}
          />

          {/* File Input - MUI tarzında */}
          <Box>
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              style={{ display: 'none' }}
              {...register('image', {
                required: true,
                onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFileName(file.name);
                },
              })}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{ borderRadius: 7, textTransform: 'capitalize' }}
              >
                Dosya Seç
              </Button>
              {selectedFileName && (
                <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                  {selectedFileName}
                </Typography>
              )}
            </label>
          </Box>

          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >

            <Button 
              variant="outlined" 
              href='/categories'
              sx={{ px: 3, color: 'orangered', borderColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
            >
              Geri
            </Button>

            <Button 
              variant="contained" 
              type="submit" 
              disabled={isSubmitting}
              sx={{ px: 3, backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
            >
              Kaydet
            </Button>

          </Box>
        
        </Stack>
      </Card>


    </Box>
  );
}
