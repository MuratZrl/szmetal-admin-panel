'use client';
// src/features/products/components/ProductDetailEditButton.client.tsx

import * as React from 'react';
import type { Route } from 'next';
import Link from '@/components/Link';

import { Box, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

type Props = {
  id: string;
  canEdit: boolean;
};

export default function ProductDetailEditButton({ id, canEdit }: Props): React.JSX.Element | null {
  if (!canEdit) return null;

  const cleanId = id.trim();
  if (!cleanId) return null;

  const editHref = (`/products/${encodeURIComponent(cleanId)}/edit` as unknown as Route);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        component={Link}
        href={editHref}
        variant="text"
        color="contrast"
        endIcon={<EditIcon />}
        draggable={false}
        sx={{ borderRadius: 1.5, textTransform: 'capitalize' }}
      >
        Profili Düzenle
      </Button>
    </Box>
  );
}
