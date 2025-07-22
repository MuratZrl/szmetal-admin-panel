// app/(admin)/_constants_/product-columns/giyotin-sistemi.tsx
'use client';

import Image from 'next/image';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';

import { deleteRow } from '../../../lib/CUD';

const getColumns = (slug: string): GridColDef[] => [
  {
    field: 'profil_resmi',
    headerName: 'Resim',
    flex: 1,

    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,

    renderCell: (params) => (
      <Box sx={{ position: 'relative', width: 48, height: 48 }}>
        <Image
          src={params.value}
          alt="profil"
          fill
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      </Box>
    ),
  },
  { 
    field: 'profil_kodu', 
    headerName: 'Kod', 
    flex: 1,

    sortable: true,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  { 
    field: 'profil_adi', 
    headerName: 'Adı', 
    flex: 1,

    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  { 
    field: 'birim_agirlik', 
    headerName: 'Ağırlık (kg/m)', 
    flex: 1,

    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  {
    field: 'actions',
    headerName: 'İşlemler',
    renderCell: ({ row }) => (
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => deleteRow('system_profiles', row.id, slug)}
        sx={{ Color: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
      >
        Sil
      </Button>
    ),
  },
];

export default getColumns;