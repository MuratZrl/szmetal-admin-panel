// app/(admin)/notifications/_constants_/columns.ts
'use server'

import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoIcon from '@mui/icons-material/Info';

export const ordersColumns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Başlık',
    flex: 0.75,

    editable: false,
    sortable: false,
    resizable: false,
    filterable: false,
    disableColumnMenu: true,
  },
  {
    field: 'message',
    headerName: 'Açıklama',
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

    renderCell: (params) => {
      const value = params.value;

      let icon, color;

      switch (value) {
        case 'success':
          icon = <CheckCircleIcon sx={{ fontSize: 16, color: 'green !important' }} />;
          color = 'green';
          break;
        case 'rejected':
          icon = <ReportProblemIcon sx={{ fontSize: 16, color: 'red !important' }} />;
          color = 'red';
          break;
        default:
          icon = <InfoIcon sx={{ fontSize: 16, color: 'dodgerblue !important' }} />;
          color = 'dodgerblue';
          break;
      }

      return (
        <Chip
          icon={icon}
          label={value}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'transparent',
            borderColor: color,
            color: color,
            fontWeight: 500,
            px: 0.25,
            textTransform: 'capitalize',
          }}
        />
      );
    },
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
