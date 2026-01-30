'use client';
// src/features/products/components/ProductInfo/ProductMetaRow.client.tsx

import * as React from 'react';

import { Box, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

type Props = {
  createdBy?: string | null;
  createdAt?: string | null;
};

export default function ProductMetaRow({ createdBy, createdAt }: Props): React.JSX.Element {
  const createdByText = createdBy || 'Bilinmiyor';
  const createdDate = typeof createdAt === 'string' && createdAt ? createdAt.slice(0, 10) : '';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.85,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <PersonOutlineIcon fontSize="small" />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, letterSpacing: 0.2, fontStyle: 'italic' }}
        >
          Yükleyen:
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: createdBy ? 1 : 0.75,
          }}
          title={createdBy ?? undefined}
        >
          {createdByText}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontStyle: 'italic',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          opacity: createdDate ? 0.9 : 0.6,
        }}
        title={createdAt ?? undefined}
      >
        {createdDate ? `Eklenme tarihi: ${createdDate}` : 'Eklenme tarihi: —'}
      </Typography>
    </Box>
  );
}
