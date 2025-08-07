// app/_dataGrid_/productsColumns.ts

import { GridColDef } from '@mui/x-data-grid';

export const productColumns: GridColDef[] = [
  { field: 'title', headerName: 'Ürün Adı', flex: 1 },
  { field: 'price', headerName: 'Fiyat', flex: 1, type: 'number' },
  { field: 'stock', headerName: 'Stok', flex: 1, type: 'number' },
  {
    field: 'created_at',
    headerName: 'Oluşturulma Tarihi',
    flex: 1,
    renderCell: (params) => (
      <span>{new Date(params.value).toLocaleDateString('tr-TR')}</span>
    ),
  }
];
