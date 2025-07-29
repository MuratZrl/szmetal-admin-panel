// app/(admin)/systems/step3/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';

import { 
  Box, 
  Card,
  Button, 
  CircularProgress, 
  Snackbar, 
  Alert,
} 
from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import ConfirmDialog from '../../../_components_/ui/dialogs/ConfirmDialog';

import StepperComponent from '../../../_components_/ui/stepper/Stepper';
import { systemStep3Configs } from '../../../_constants_/systems/step3/systemConfigs';

import { 
  GiyotinProfilHesapli, 
  SistemOzet 
} from '../../../types/systemTypes';

import { supabase } from '../../../../lib/supabase/supabaseClient';

// ******************************************************************************************

export default function SummaryPage() {
  const router = useRouter();
  const { slug } = useParams();;

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const slugStr = slug as string;

  const config = systemStep3Configs[slugStr];

  const [rows2, setRows2] = useState<GiyotinProfilHesapli[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

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

    // Giriş yapan kullanıcıyı al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSnackbarMessage('Kullanıcı bilgisi alınamadı!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Kullanıcının profil bilgilerini al
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('username, email, company')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      setSnackbarMessage('Kullanıcı profili alınamadı!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Veriyi requests tablosuna ekle
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
      setSnackbarMessage('Kayıt eklenemedi!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Başarılıysa:
    setSnackbarMessage('Talebiniz Oluşturuldu! 🎉');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);

    // 1.5 saniye sonra yönlendir
    setTimeout(() => {
      router.push('/systems');
    }, 1500);
  };


  // ❗ hook'lar çalıştıktan sonra koşullu render
  if (!config) return <div>Geçersiz sistem: {slugStr}</div>;
  if (loading) return <div className="flex justify-center mt-10"><CircularProgress /></div>;
  if (fetchError) return <div className="text-red-500 text-center mt-10">{fetchError}</div>;

  const columns1 = config.summaryColumns;
  const columns2 = config.materialColumns;

  return (
    <Box sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }} >

        {/* Stepper */}
        <Box mb={{ xs: 2, sm: 3 }}>
          <StepperComponent activeStep={2} />
        </Box>

        {/* Genel Bilgiler */}
        <Card 
          sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 2, borderRadius: 7 }} 
        >

          <DataGrid
            rows={rows1}
            columns={columns1}
            getRowId={(row) => row.id}
            loading={loading}

            hideFooter
            disableAutosize
            disableColumnFilter
            disableRowSelectionOnClick
            showToolbar
            label='Genel Bilgiler'

            autoHeight
            sx={{
              borderRadius: 5,
              '& .MuiDataGrid-columnHeader': {
                backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'white',
                fontWeight: 600,
              },
            }}
          />

        </Card>

        {/* Malzeme Listesi */}
        <Card
          sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 7 }} 
        >

          <DataGrid
            rows={rows2}
            columns={columns2}
            rowHeight={125}
            getRowId={(row) => row.profil_kodu}
            loading={loading}

            hideFooter
            disableAutosize
            disableColumnFilter
            disableRowSelectionOnClick
            disableDensitySelector
            showToolbar
            label='Malzeme Listesi'

            autoHeight
            sx={{
              borderRadius: 5,
              '& .MuiDataGrid-columnHeader': {
                backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'white',
                fontWeight: 600,
              },
            }}
          />

        </Card>

        {/* Butonlar */}
        <Box
          mt={6}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          gap={2}
          px={1}
        >
          <Button
            variant="outlined"
            onClick={() => router.push(`/systems/${slug}/step2`)}
            sx={{
              px: 4,
              py: 1,
              width: { xs: '100%', sm: 'auto' },
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
            onClick={() => setConfirmOpen(true)}
            
            sx={{
              px: 4,
              py: 1,
              width: { xs: '100%', sm: 'auto' },
              backgroundColor: 'orangered',
              borderRadius: 7,
              textTransform: 'capitalize',
            }}
          >
            Onayla
          </Button>
        </Box>

        {/* Onay Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            handleConfirm();
          }}
          title="Talebi Onayla"
          description="Bu talebi sistem kaydına eklemek üzeresiniz. Devam etmek istiyor musunuz?"
          confirmText="Evet, Onayla"
          cancelText="İptal"
        />

        {/* Snackbar */}
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
