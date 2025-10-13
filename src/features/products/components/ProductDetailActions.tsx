// src/features/products/components/ProductDetailActions.client.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';
import { productCanonicalPath } from '@/features/products/utils/url';
import type { Route } from 'next'; // ← Typed Routes için

type Props = {
  id: string;
  canEdit: boolean;
  /** Tercihen profileCode; yoksa code; hiçbiri yoksa id kullanılacak. */
  profileCode?: string | null;
  code?: string | null;
};

// Sadece iç rotalara izin ver; domainli URL, JS şakası vs. yasak.
const ALLOWED_PREFIXES = ['/products', '/requests', '/orders', '/account', '/clients'] as const;

function safeInternalPath(input: string | null): string | null {
  if (!input) return null;

  let p = input;
  // from genelde encode edilerek gelebilir
  try {
    p = decodeURIComponent(p);
  } catch {
    return null;
  }

  // Absolute URL veya protokollü şeyler yasak
  if (/^(https?:)?\/\//i.test(p)) return null;

  // Mutlaka kök / ile başlamalı
  if (!p.startsWith('/')) return null;

  // Beyaz liste
  if (!ALLOWED_PREFIXES.some(base =>
    p === base || p.startsWith(base + '/') || p.startsWith(base + '?')
  )) {
    return null;
  }

  return p;
}

export default function ProductDetailActions({ id, canEdit, profileCode, code }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Listeden gelirken ?from= eklenmiş olabilir
  const rawFrom = searchParams.get('from');
  const safeFrom = safeInternalPath(rawFrom);

  // Typed Routes: Route tipine çeviriyoruz. any kullanmıyoruz.
  const fallbackHref = (safeFrom ?? '/products') as unknown as Route;

  // Edit için kanonik URL
  const baseHref = productCanonicalPath({
    id: Number.isFinite(Number(id)) ? Number(id) : 0,
    profileCode: profileCode ?? null,
    code: code ?? '',
  });

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackHref); // ← Artık Route
    }
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%' }}>
        <Button
          onClick={handleBack}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          draggable={false}
          sx={{ textTransform: 'capitalize' }}
          aria-label="Geri"
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
  );
}
