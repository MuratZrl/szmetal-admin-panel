// app/(admin)/notifications/_constants_/columns.ts

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';

export const notificationColumns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Başlık',
    flex: 1,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'message',
    headerName: 'Mesaj',
    flex: 2,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'type',
    headerName: 'Tip',
    flex: 0.7,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={
          params.value === 'success'
            ? 'success'
            : params.value === 'error'
            ? 'error'
            : 'info'
        }
        size="small"
      />
    ),
  },
  {
    field: 'is_read',
    headerName: 'Durum',
    flex: 0.7,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) =>
      params.value ? (
        <Chip label="Okundu" color="default" size="small" />
      ) : (
        <Chip label="Yeni" color="success" size="small" />
      ),
  },
  {
    field: 'created_at',
    headerName: 'Tarih',
    flex: 1,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      try {
        const raw = params.value;
        if (!raw) return '—';

        const utcDate = new Date(raw);
        if (isNaN(utcDate.getTime())) return 'Geçersiz';

        const turkiyeDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);
        return turkiyeDate.toLocaleString('tr-TR');
      } catch {
        return 'Hata';
      }
    }
  },
];
