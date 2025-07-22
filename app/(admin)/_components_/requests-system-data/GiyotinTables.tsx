'use client';

import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

import { giyotinGenelBilgiColumns, giyotinMalzemeColumns } from '../../_constants_/systems/system-columns/giyotin-sistemi';

import { SistemOzet, GiyotinProfilHesapli } from '../../types/systemTypes';

type Props = {
  summaryData: SistemOzet[];   // veya tipin varsa: GiyotinProfilHesapli[]
  materialData: GiyotinProfilHesapli[];
};

export default function GiyotinTables({ summaryData, materialData }: Props) {
  return (
    <Box>

      <Typography variant="h6" mt={5} mb={1} px={1}>
        Sistem Özeti
      </Typography>

      <DataGrid
        rows={summaryData}
        columns={giyotinGenelBilgiColumns}
        getRowId={(row) => row.id}
        autoHeight
        hideFooter
        disableRowSelectionOnClick
        sx={{
          borderRadius: 5,
          '& .MuiDataGrid-columnHeader': {
            backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)'
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'white',
            fontWeight: 600,
          },
        }}
      />

      <Typography variant="h6" mt={5} mb={1} px={1}>
        Malzeme Listesi
      </Typography>

      <DataGrid
        rows={materialData}
        columns={giyotinMalzemeColumns}
        getRowId={(row) => row.profil_kodu + row.kesim_olcusu}
        rowHeight={100}
        autoHeight
        hideFooter
        disableRowSelectionOnClick
        sx={{
          borderRadius: 5,
          '& .MuiDataGrid-columnHeader': {
            backgroundImage: 'linear-gradient(to top, #111111ff, #4a4a4a)'
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'white',
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
}
