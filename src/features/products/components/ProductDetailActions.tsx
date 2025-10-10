// src/features/products/components/ProductDetailActions.client.tsx
'use client';

import React from 'react';
import Link from 'next/link';

import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type Props = { id: string; canEdit: boolean };

export default function ProductDetailActions({ id, canEdit }: Props) {

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ width: '100%' }}
    >

      <Stack direction="row" spacing={1}>

        <Button
          component={Link}
          href={`/products/${id}`}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          draggable={false}
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
            else window.location.href = `/products/${id}`;
          }}
          sx={{ textTransform: 'capitalize' }}
        >
          Geri
        </Button>

        {canEdit && (
          <Button
            component={Link}
            href={`/products/${id}/edit`}
            variant="contained"
            startIcon={<EditIcon />}
            draggable={false}
            sx={{ textTransform: 'capitalize' }}
          >
            Profili Düzenle
          </Button>
        )}

      </Stack>
    
    </Stack>
  );
}
