// src/features/requests/components/id/FormInfoCard.tsx
import * as React from 'react';

import { Paper, Typography, Divider, Stack } from '@mui/material';

import KeyValue from '@/features/requests/components/id/KeyValue';

import type { FormData } from '@/features/requests/types';

type Props = { form: FormData | undefined };

export default function FormInfoCard({ form }: Props) {
  const f = form ?? {};
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Form Bilgileri</Typography>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>
        <KeyValue label="Sistem Adet" value={f.sistem_adet} />
        <KeyValue label="Sistem Genişlik (mm)" value={f.sistem_genislik} />
        <KeyValue label="Sistem Yükseklik (mm)" value={f.sistem_yukseklik} />
        <KeyValue label="Açıklama" value={f.description} />
      </Stack>
    </Paper>
  );
}
