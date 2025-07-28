// app/(admin)/products/[slug]/page.tsx

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { Box, Paper, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import AddProductDialog from '../../_components_/ui/dialogs/AddProductDialog';

import { deleteRow } from '../../../lib/CUD';

import { supabase } from '../../../lib/supabase/supabaseClient';

type DynamicRow = {
  id: string;
  [key: string]: string | number | null; // diğer alanlar dinamik
};

export default function ProductDetailPage() {

  const [editData, setEditData] = useState<DynamicRow | null>(null);
  
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0] ?? '';

  // ✅ dynamic import yerine async dynamic içinden columns'u al
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<DynamicRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);

  const formatSlugToTitle = (slug: string) => {
    return slug
      .split('-')                     // ['giyotin', 'sistemi']
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // ['Giyotin', 'Sistemi']
      .join(' ');                     // 'Giyotin Sistemi'
  };

  // ******************************************************************************************

  const rowLimits: Record<string, number> = {
    'giyotin-sistemi': 14,
    'cam-balkon-sistemi': 10,
    'profil-sistemi': 20,
    'sürme-sistem': 12,
    'katlanir-sistem': 8,
    'cephe-sistemi': 16,
    'kapi-sistemi': 18,
  };

  const limit = rowLimits[slug]; // o slug için sınır varsa alır
  const isAddDisabled = typeof limit === 'number' && rows.length >= limit;

  // ******************************************************************************************

  // useEffect'in DIŞINDA tanımlanmalı:
  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('system_profiles')
      .select('*')
      .eq('system_slug', slug);

    if (!error && data) {
      setRows(data);
    }

    setLoading(false);
  }, [slug]);

  // ******************************************************************************************

  const actionColumn = useMemo<GridColDef>(() => ({
    field: 'actions',
    headerName: 'İşlemler',
    flex: 1,

    resizable: false,
    editable: false,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    
    renderCell: (params) => (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} >
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setEditData(params.row);
              setAddOpen(true);
            }}
            sx={{ borderRadius: 7, textTransform: 'capitalize' }}
          >
            Düzenle
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={async () => {
              const success = await deleteRow('system_profiles', params.row.id, slug);
              if (success) {
                fetchProfiles(); // ✅ Listeyi yeniden getir
              }
            }}
            sx={{ borderRadius: 7, textTransform: 'capitalize' }}
          >
            Sil
          </Button>
        </Stack>
      </Box>
    )
  }), [slug, fetchProfiles]); // 👈 memo sadece slug değişince yeniden oluşur

  // ******************************************************************************************

  // useEffect hook'ları
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const mod = await import(`../../_constants_/product-columns/${slug}`);
        const getColumns = mod.default;
        if (typeof getColumns === 'function') {
          const baseColumns = getColumns(slug);
          setColumns([...baseColumns, actionColumn]); // ✅ İşlem sütununu en sona ekle
        } else {
          console.error('columns exportu bir fonksiyon değil!');
          setColumns([]); // fallback
        }
      } catch (err) {
        console.error('Kolonlar yüklenemedi:', err);
        setColumns([]);
      }
    };

    if (slug) {
      fetchColumns();
      fetchProfiles(); // ✅ burada kullanılabilir
    }
  }, [slug, fetchProfiles, actionColumn]);

  return (
    <Box py={{ xs: 2, sm: 4 }} px={{ xs: 1.5, sm: 2 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 7 }}>
        
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={2}
          px={{ xs: 1, sm: 2 }}
        >
          <Typography variant="h5">
            {formatSlugToTitle(slug)} Profilleri
          </Typography>

          <Button
            variant="contained"
            disabled={isAddDisabled}
            onClick={() => {
              setEditData(null);
              setAddOpen(true);
            }}
            sx={{
              px: 4,
              backgroundColor: 'darkolivegreen',
              borderRadius: 7,
              textTransform: 'capitalize',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Ekle
          </Button>
        </Stack>

        {/* DataGrid */}
        <Box mt={2} sx={{ height: { xs: 400, sm: 500, md: 700 } }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              hideFooter
              sx={{
                borderRadius: 7,
                '& .MuiDataGrid-columnHeader': {
                  backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: 'white',
                  fontWeight: 600,
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Dialog */}
      <AddProductDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditData(null);
        }}
        slug={slug}
        table="system_profiles"
        initialData={
          editData
            ? {
                id: String(editData.id),
                profil_kodu: String(editData.profil_kodu ?? ''),
                profil_adi: String(editData.profil_adi ?? ''),
                profil_resmi: String(editData.profil_resmi ?? ''),
                birim_agirlik: Number(editData.birim_agirlik ?? 0),
              }
            : null
        }
        onSuccess={() => {
          setAddOpen(false);
          setEditData(null);
          fetchProfiles();
        }}
      />
    </Box>
  );

}
