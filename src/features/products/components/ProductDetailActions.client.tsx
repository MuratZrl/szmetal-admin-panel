// src/features/products/components/ProductDetailActions.client.tsx
'use client';

import React from 'react';
import type { Route } from 'next';
import Link from '@/components/Link';

import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  id: string;
  canEdit: boolean;
  // İstersen gösterimde kullanırsın, routing için artık gerekmiyor
  profileCode?: string | null;
  code?: string | null;
};

const ALLOWED_PREFIXES = ['/products', '/requests', '/orders', '/account', '/clients'] as const;

function safeInternalPath(input: string | null): string | null {
  if (!input) return null;
  let p = input;
  try {
    p = decodeURIComponent(p);
  } catch {
    return null;
  }
  if (/^(https?:)?\/\//i.test(p)) return null;
  if (!p.startsWith('/')) return null;
  const ok = ALLOWED_PREFIXES.some(base =>
    p === base || p.startsWith(base + '/') || p.startsWith(base + '?'),
  );
  return ok ? p : null;
}

export default function ProductDetailActions({ id, canEdit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawFrom = searchParams.get('from');
  const safeFrom = safeInternalPath(rawFrom);
  const fallbackHref = (safeFrom ?? '/products') as unknown as Route;

  // Routing her zaman uuid id üzerinden
  const cleanId = id.trim();
  const baseHref = `/products/${encodeURIComponent(cleanId)}` as `/products/${string}`;
  const editHref = `${baseHref}/edit` as Route;

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{ width: '100%' }}
    >
      <Button
        onClick={handleBack}
        variant="outlined"
        color="contrast"
        startIcon={<ArrowBackIcon />}
        draggable={false}
        sx={{ borderRadius: 1.5, textTransform: 'capitalize' }}
        aria-label="Geri"
      >
        Geri
      </Button>

      {canEdit && (
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
      )}
    </Stack>
  );
}
