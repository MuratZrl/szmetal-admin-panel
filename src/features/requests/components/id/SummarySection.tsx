// src/features/requests/components/id/SummarySection.tsx
import * as React from 'react';

import { Paper, Typography, Divider, Chip, Stack } from '@mui/material';

import type { SummaryItem } from '@/features/requests/types';

type Props = { summary: SummaryItem | null };

export default function SummarySection({ summary }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Özet</Typography>
      <Divider sx={{ mb: 1 }} />
      {summary ? (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`Toplam Ağırlık: ${summary.toplam_kg}`} variant="outlined" />
          <Chip label={`Cam Metraj: ${summary.cam_metraj} m`} variant="outlined" />
          <Chip label={`Sistem Metraj: ${summary.sistem_metraj} m`} variant="outlined" />
          <Chip label={`Kayar Cam Adet: ${summary.kayar_cam_adet}`} variant="outlined" />
          <Chip label={`Kayar Cam Genişlik: ${summary.kayar_cam_genislik} mm`} variant="outlined" />
          <Chip label={`Kayar Cam Yükseklik: ${summary.kayar_cam_yukseklik} mm`} variant="outlined" />
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">Özet verisi bulunamadı.</Typography>
      )}
    </Paper>
  );
}
