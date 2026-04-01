'use client';
// src/features/products/components/ProductInfo/ProductMetaRow.client.tsx

import * as React from 'react';

import { Box, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

type Props = {
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function ProductMetaRow({ createdBy, createdAt, updatedAt }: Props): React.JSX.Element {
  const createdByText = createdBy || 'Bilinmiyor';
  const createdDate = typeof createdAt === 'string' && createdAt ? createdAt.slice(0, 10) : '';
  const updatedDate = typeof updatedAt === 'string' && updatedAt ? updatedAt.slice(0, 10) : '';
  const showUpdated = updatedDate && updatedDate !== createdDate;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <PersonOutlineIcon
          fontSize="small"
          sx={{
            transform: 'skewX(-12deg)',
            transformOrigin: 'center',
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, fontStyle: 'italic' }}
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

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
            opacity: createdDate ? 0.9 : 0.6,
          }}
          title={createdAt ?? undefined}
        >
          {createdDate ? `Eklenme tarihi: ${createdDate}` : 'Eklenme tarihi: —'}
        </Typography>

        {showUpdated && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
              opacity: 0.9,
            }}
            title={updatedAt ?? undefined}
          >
            Güncellenme tarihi: {updatedDate}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
