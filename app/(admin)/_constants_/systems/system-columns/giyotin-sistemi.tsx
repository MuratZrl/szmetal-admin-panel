// app/(admin)/_constants_/systems/system-columns/giyotin-sistemi.ts

import { GridColDef } from '@mui/x-data-grid';

import Image from 'next/image';

export const giyotinGenelBilgiColumns: GridColDef[] = [
  { field: 'sistem_metraj', headerName: 'Sistem Metraj', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'cam_metraj', headerName: 'Cam Metraj', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'kayar_cam_adet', headerName: 'Kayar Cam Adedi', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'kayar_cam_genislik', headerName: 'Kayar Cam Genişliği', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'kayar_cam_yukseklik', headerName: 'Kayar Cam Yüksekliği', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'toplam_kg', headerName: 'Toplam KG', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
];

export const giyotinMalzemeColumns: GridColDef[] = [
  {
    field: 'profil_resmi',
    headerName: 'Profil Resmi',
    flex: 1,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,

    renderCell: (params) => (
      <div style={{ position: 'relative', width: 100, height: '100%' }}>
        <Image
          src={params.value}
          alt="profil"
          fill
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      </div>
    ),
  },
  { field: 'profil_kodu', headerName: 'Profil Kodu', flex: 0.5, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'profil_adi', headerName: 'Profil Adı', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'kesim_olcusu', headerName: 'Kesim Ölçüsü', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
  { field: 'verilecek_adet', headerName: 'Verilecek Adet', flex: 1, sortable: false, editable: false, resizable: false, filterable: false, disableColumnMenu: true },
];
