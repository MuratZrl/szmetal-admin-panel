// src/features/requests/components/id/RequestDetailHeader.tsx
import * as React from 'react';
import { Typography } from '@mui/material';

type Props = { id: string; systemSlug?: string | null };

export default function RequestDetailHeader({ id, systemSlug }: Props) {
  return (
    <Typography variant="h5" sx={{ mb: 1.5 }}>
      Talep Detayı — #{id}{systemSlug ? ` — ${systemSlug}` : ''}
    </Typography>
  );
}
