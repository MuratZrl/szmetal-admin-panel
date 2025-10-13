// src/features/products/components/ProductDetailActions.client.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { productCanonicalPath } from '@/features/products/utils/url';

type Props = {
  id: string;
  canEdit: boolean;
  /** Tercihen profileCode; yoksa code; hiçbiri yoksa id kullanılacak. */
  profileCode?: string | null;
  code?: string | null;
};

export default function ProductDetailActions({ id, canEdit, profileCode, code }: Props) {
  
  const baseHref = productCanonicalPath({
    id: Number.isFinite(Number(id)) ? Number(id) : 0,
    profileCode: profileCode ?? null,
    code: code ?? '', // ← null değil, boş string
  });

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1}>
        <Button
          component={Link}
          href={baseHref}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          draggable={false}
          sx={{ textTransform: 'capitalize' }}
        >
          Geri
        </Button>

        {canEdit && (
          <Button
            component={Link}
            href={`${baseHref}/edit`}
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
