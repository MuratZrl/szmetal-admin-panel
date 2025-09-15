// src/features/requests/components/id/MaterialListCard.tsx
import * as React from 'react';
import { Paper, Typography, Divider } from '@mui/material';

import MaterialTable from '@/features/requests/components/id/TableGrid.client';

import type { MaterialRow } from '@/features/requests/types';

type Props = { rows: MaterialRow[] };

export default function MaterialListCard({ rows }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Detay Listesi</Typography>
      <Divider sx={{ mb: 1.5 }} />
      <MaterialTable rows={rows} />
    </Paper>
  );
}
