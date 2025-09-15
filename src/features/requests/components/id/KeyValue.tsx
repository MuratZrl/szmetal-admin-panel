// src/features/requests/components/common/KeyValue.tsx
import * as React from 'react';
import { Box, Typography } from '@mui/material';

type Props = { label: string; value?: string | null };

export default function KeyValue({ label, value }: Props) {
  const v = value?.toString().trim();
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant="body2">{v && v.length > 0 ? v : '---'}</Typography>
    </Box>
  );
}
