'use client';
// src/features/products/components/ProductDetailActions.client.tsx

import * as React from 'react';
import type { Route } from 'next';
import Link from '@/components/Link';

import { Box, Button, Divider, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import ProductDetailEditButton from '@/features/products/screen/detail/ProductInfo/ProductDetailEditButton.client';

type Props = {
  id: string;
  canEdit: boolean;
  code?: string | null;
  newerProductId?: string | null; // “Geri” = daha yeni
  olderProductId?: string | null; // “İleri” = daha eski
};

export default function ProductDetailActions({
  id,
  canEdit,
  newerProductId = null,
  olderProductId = null,
}: Props): React.JSX.Element {
  const newerHref = newerProductId
    ? (`/products/${encodeURIComponent(newerProductId)}` as unknown as Route)
    : null;

  const olderHref = olderProductId
    ? (`/products/${encodeURIComponent(olderProductId)}` as unknown as Route)
    : null;

  const showNav = Boolean(newerHref || olderHref);

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {/* ÜST SATIR: Sol (Yeni/Eski) - Sağ (Ana Sayfa) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        {showNav ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            {newerHref ? (
              <Button
                component={Link}
                href={newerHref}
                variant="outlined"
                color="contrast"
                startIcon={<ArrowBackIcon />}
                draggable={false}
                sx={{ borderRadius: 1.5, textTransform: 'capitalize' }}
                aria-label="Geri (daha yeni)"
              >
                Yeni
              </Button>
            ) : null}

            {olderHref ? (
              <Button
                component={Link}
                href={olderHref}
                variant="outlined"
                color="contrast"
                endIcon={<ArrowForwardIcon />}
                draggable={false}
                sx={{ borderRadius: 1.5, textTransform: 'capitalize' }}
                aria-label="İleri (daha eski)"
              >
                Eski
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Box />
        )}

        <Button
          component={Link}
          href={'/products' as unknown as Route}
          variant="text"
          color="contrast"
          startIcon={<HomeIcon />}
          draggable={false}
          sx={{ borderRadius: 1.5, textTransform: 'capitalize' }}
          aria-label="Ana Sayfa"
        >
          Ana Sayfa
        </Button>
      </Stack>

      {/* ALT KATMAN: Divider + sadece edit (sağda) */}
      {canEdit ? (
        <>
          <Divider sx={{ opacity: 0.7 }} />
          <ProductDetailEditButton id={id} canEdit={canEdit} />
        </>
      ) : null}
    </Stack>
  );
}
