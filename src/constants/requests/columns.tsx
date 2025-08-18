// app/_constants_/requests/requests-columns.tsx

import React from 'react';

import { GridColDef } from '@mui/x-data-grid';

import { RequestRowUnion } from '@/types/requestsTypes';

import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';

export const getRequestsColumns = (onViewDetail: (id: string) => void): GridColDef<RequestRowUnion>[] => [
  {
    field: 'id',
    headerName: 'ID',
    flex: 0.25,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,
  },
  {
    field: 'user_id',
    headerName: 'Kullanıcı ID',
    flex: 0.5,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,
  },
  {
    field: 'system_slug',
    headerName: 'Sistem',
    flex: 1,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => {
      const map: Record<string, string> = {
        'giyotin-sistemi': 'Giyotin Sistemi',
        'cam-balkon-sistemi': 'Cam Balkon Sistemi',
        'kupeste-sistemi': 'Küpeşte Sistemi',

        // Diğer sistemler...
      };

      return map[params.value as string] || params.value;
    },
  },
  {
    field: 'username',
    headerName: 'Kullanıcı Adı',
    flex: 1,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => (
      <span>
        {params.row.users?.username ?? '—'}
      </span>
    ),
  },
  {
    field: 'email',
    headerName: 'E-posta',
    flex: 1,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => (
      <span>
        {params.row.users?.email ?? '—'}
      </span>
    ),
  },
  {
    field: 'company',
    headerName: 'Şirket / Firma',
    flex: 1,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => (
      <span>
        {params.row.users?.company ?? '—'}
      </span>
    ),
  },
  {
    field: 'status',
    headerName: 'Durum',
    flex: 1,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => {
      const value = (params.value as string) ?? '';

      const statusMap: Record<
        string,
        {
          label: string;
          color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
          icon: React.ReactElement;
        }
      > = {
        pending: {
          label: 'Bekleyen',
          color: 'warning',
          icon: <HourglassTopIcon sx={{ fontSize: 16, mr: 0.5 }} />,
        },
        approved: {
          label: 'Onaylandı',
          color: 'success',
          icon: <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />,
        },
        rejected: {
          label: 'Reddedildi',
          color: 'error',
          icon: <CancelIcon sx={{ fontSize: 16, mr: 0.5 }} />,
        },
      };

      const status = statusMap[value] || {
        label: value,
        color: 'default',
        icon: null,
      };

      return (
        <Chip
          label={
            <span className="flex items-center">
              {status.icon}
              <span>{status.label}</span>
            </span>
          }
          color={status.color}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: 'created_at',
    headerName: 'Tarih',
    flex: 1,

    renderCell: (params) => {
      const raw = params.value;
      if (!raw) return '—';

      const utcDate = new Date(raw);
      if (isNaN(utcDate.getTime())) return 'Geçersiz';

      // ✅ Türkiye saati için +3 saat ekle
      const turkiyeDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

      return turkiyeDate.toLocaleString('tr-TR');
    },
  },
  {
    field: 'detail',
    headerName: 'Detay',
    flex: 0.5,

    sortable: false,
    resizable: false,
    editable: false,
    disableColumnMenu: true,
    filterable: false,

    renderCell: (params) => (
      <span 
        className="text-blue-500 cursor-pointer hover:underline"
        onClick={() => onViewDetail(params.row.id)}
      >
        Görüntüle
      </span>
    ),
  },
];
