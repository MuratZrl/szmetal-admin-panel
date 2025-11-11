// src/features/products/components/ProductHeader.client.tsx
'use client';

import * as React from 'react';
import { Typography, Divider, Box } from '@mui/material';

type Props = { code: string; name: string };

export default function ProductHeader({ code, name }: Props): React.JSX.Element {
  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
        {code} — {name}
      </Typography>
      <Divider sx={{ mb: 2 }} />
    </Box>
  );
}
