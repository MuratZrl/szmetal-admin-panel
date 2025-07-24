// app/(admin)/systems/step3/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';

import { Box, Card, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import StepperComponent from '../../../_components_/ui/stepper/Stepper';
import { systemStep3Configs } from '../../../_constants_/systems/step3/systemConfigs';

import { 
  GiyotinProfilHesapli, 
  SistemOzet 
} from '../../../types/systemTypes';

import { supabase } from '../../../../lib/supabaseClient';


// ******************************************************************************************

export default function SummaryPage() {
  const router = useRouter();
  const { slug } = useParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const slugStr = slug as string;

  const config = systemStep3Configs[slugStr];

  const [rows2, setRows2] = useState<GiyotinProfilHesapli[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ✅ Güvenli localStorage okuma
  const form = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('systemData') || '{}');
    } catch (e) {
      console.error('Form verisi okunamadı:', e);
      return {};
    }
  }, []);

  // ✅ Hesaplamayı optimize et
  const rows1: SistemOzet[] = useMemo(() => {
    return config ? config.summaryCalculator(form, rows2) : [];
  }, [form, rows2, config]);

  useEffect(() => {
    if (!config) return;

    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from(config.supabaseTable)
        .select('*')
        .eq(config.supabaseFilterColumn, slugStr);

      if (error) {
        console.error('Supabase verisi alınamadı:', error);
        setFetchError('Veri alınırken hata oluştu.');
        setLoading(false);
        return;
      }

      const hesaplanmis = config.materialCalculator(form, data);
      setRows2(hesaplanmis);
      setLoading(false);
    };

    fetchData();
  }, [slugStr, config, form]);

  // "Onayla" butonuna tıklandığında "requests" tablosuna veri ekleyen fonksiyon.
  const handleConfirm = async () => {
    // Giriş yapan kullanıcının kimliğini al (sadece ID için)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Kullanıcı bilgisi alınamadı.', userError);
      return;
    }

    // user.id ile kendi `users` tablosundan bilgileri al
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('username, email, company')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Kullanıcı profili alınamadı:', profileError);
      return;
    }

    // İsteği requests tablosuna kaydet
    const { error: insertError } = await supabase.from('requests').insert([
      {
        user_id: user.id,
        system_slug: slugStr,
        form_data: JSON.parse(JSON.stringify(form)),
        summary_data: JSON.parse(JSON.stringify(rows1)),
        material_data: JSON.parse(JSON.stringify(rows2)),
        status: 'pending',
      },
    ]);

    if (insertError) {
      console.error('❌ Kayıt eklenemedi:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });

      setSnackbarMessage('Kayıt eklenemedi!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Kayıt başarıyla eklendi 🎉');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Biraz bekleyip yönlendir (1.5 saniye sonra)
      setTimeout(() => {
        router.push('/systems');
      }, 1500);
    }
  };

  // ❗ hook'lar çalıştıktan sonra koşullu render
  if (!config) return <div>Geçersiz sistem: {slugStr}</div>;
  if (loading) return <div className="flex justify-center mt-10"><CircularProgress /></div>;
  if (fetchError) return <div className="text-red-500 text-center mt-10">{fetchError}</div>;

  const columns1 = config.summaryColumns;
  const columns2 = config.materialColumns;

  return (
    <Box className="max-w-6xl mx-auto p-3">

      {/* ******************** 3. Adım ******************** */}
      <StepperComponent activeStep={2} />

      <Card sx={{ p: 2, mb: 2, borderRadius: 7 }} >

        <Typography variant="subtitle1" gutterBottom>
          Genel Bilgiler
        </Typography>

        <DataGrid 
          rows={rows1}
          columns={columns1}
          getRowId={(row) => row.id} // ✅ id zorunlu!
          hideFooter 
          disableRowSelectionOnClick 
              
          sx={{
            border: 'none',
            '& .MuiDataGrid-main': {
              borderRadius: 3,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none', // opsiyonel
            },
          }}
        />

      </Card>

      <Card sx={{ p: 2, borderRadius: 7 }} >

        <Typography variant="subtitle1" gutterBottom>
          Malzeme Listesi
        </Typography>

          <DataGrid
            rows={rows2}
            columns={columns2}
            rowHeight={125}
            getRowId={(row) => row.profil_kodu} // 👈 burada id yerine geçer
            hideFooter 
            disableRowSelectionOnClick   
    
            sx={{
              border: 'none',
              '& .MuiDataGrid-main': {
                borderRadius: 3,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none', // opsiyonel
              },
            }}
          />

      </Card>

      <Box className="flex justify-between mt-6 px-1">
        <Button
          variant="outlined"
          onClick={() => router.push(`/systems/${slug}/step2`)}
          sx={{
            px: 4,
            py: 1,
            color: 'orangered',
            borderColor: 'orangered',
            borderRadius: 7,
            textTransform: 'capitalize',
          }}
        >
          Geri
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            px: 4,
            py: 1,
            backgroundColor: 'orangered',
            borderRadius: 7,
            textTransform: 'capitalize',
          }}
        >
          Onayla
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
}
