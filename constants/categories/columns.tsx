// app/_dataGrid_/productsColumns.ts
'use client';

import Image from 'next/image';

import { GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export const productColumns: GridColDef[] = [
  {
    field: 'image',
    headerName: 'Resim',
    flex: 1,

    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
    
    renderCell: (params) => (
      <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} height={'100%'}>

        <Image
          src={params.value}
          alt="Ürün Görseli"
          
          width={50}
          height={25}

          style={{ objectFit: 'cover', borderRadius: 4 }}
        />

      </Box>
    ),
  },
  { 
    field: 'title', 
    headerName: 'Ürün Adı', 
    type: 'string',
    flex: 1, 
  
    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  { 
    field: 'description', 
    headerName: 'Açıklama', 
    flex: 1, 
    type: 'string',
  
    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  { 
    field: 'unit_weight', 
    headerName: 'Birim Ağırlık (kg/m)', 
    flex: 1, 
    type: 'number', 
  
    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  { 
    field: 'stock', 
    headerName: 'Stok (Adet)', 
    flex: 1, 
    type: 'number',
  
    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,
  },
  {
    field: 'created_at',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,

    sortable: false,
    filterable: false,
    editable: false,
    resizable: false,
    disableColumnMenu: true,    

    renderCell: (params) => (
      <span>
        {new Date(params.value).toLocaleDateString('tr-TR')}
      </span>
    ),
  }
];
