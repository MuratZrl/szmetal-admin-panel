// app/client/usersTableColumns.ts
import Image from 'next/image';

import { GridColDef } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import BlockIcon from '@mui/icons-material/Block';
import InfoIcon from '@mui/icons-material/Info';

export const usersTableColumns: GridColDef[] = [
  {
    field: 'image',
    headerName: 'Profil Resmi',
    flex: 0.5,
    renderCell: (params) => {
      const imageUrl = params.value;

      return imageUrl ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',   // Hücre içinde dikey ortalama
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
          }}
        >
          <Box
            sx={{
              width: 45,
              height: 45,
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            <Image
              src={imageUrl}
              alt="Profil Resmi"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </Box>
        </Box>
      ) : (
        <Box component="span">{'None'}</Box>
      );
    },
    sortable: false,
    filterable: false,
    resizable: false, 
    editable: false, 
    disableColumnMenu: true
  },
  { field: 'username', headerName: 'Kullanıcı Adı', flex: 1, sortable: false, filterable: false, resizable: false, editable: false, disableColumnMenu: true },
  { field: 'email', headerName: 'E-posta', flex: 1, sortable: false, filterable: false, resizable: false, editable: false, disableColumnMenu: true },
  { field: 'company', headerName: 'Şirket / Firma', flex: 1, sortable: false, filterable: false, resizable: false, editable: false, disableColumnMenu: true },
  { field: 'phone', headerName: 'Telefon', flex: 1, sortable: false, filterable: false, resizable: false, editable: false, disableColumnMenu: true },
  {
    field: 'role',
    headerName: 'Rol',
    flex: 1,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color="default"
        size="small"
        variant="outlined"
        sx={{ pointerEvents: 'none' }}
        />
    ),
    sortable: false, 
    filterable: false, 
    resizable: false, 
    editable: false, 
    disableColumnMenu: true
  },
  {
    field: 'status',
    headerName: 'Durum',
    flex: 1,
    renderCell: (params) => {
      const status = params.value?.toLowerCase();

      let color: 'default' | 'error' | 'success' | 'warning' | 'info' = 'default';
      let label = params.value;
      let icon: React.ReactElement | undefined = undefined;

      switch (status) {
        case 'active':
        case 'aktif':
          color = 'success';
          label = 'Aktif';
          icon = <CheckCircleIcon fontSize="small" />;
          break;
        case 'inactive':
        case 'pasif':
          color = 'default';
          label = 'Pasif';
          icon = <PauseCircleIcon fontSize="small" />;
          break;
        case 'pending':
        case 'bekliyor':
          color = 'warning';
          label = 'Bekliyor';
          icon = <HourglassBottomIcon fontSize="small" />;
          break;
        case 'banned':
        case 'yasaklı':
          color = 'error';
          label = 'Yasaklı';
          icon = <BlockIcon fontSize="small" />;
          break;
        default:
          color = 'info';
          icon = <InfoIcon fontSize="small" />;
          break;
      }

      return <Chip label={label} color={color} size="small" icon={icon} sx={{ pointerEvents: 'none' }}/>;
    },
    sortable: false, 
    filterable: false, 
    resizable: false, 
    editable: false, 
    disableColumnMenu: true
  }
];
