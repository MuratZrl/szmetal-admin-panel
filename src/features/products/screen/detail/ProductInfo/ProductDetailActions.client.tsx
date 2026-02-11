'use client';

import * as React from 'react';
import type { Route } from 'next';
import Link from '@/components/Link';

import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import ProductDetailEditButton from '@/features/products/screen/detail/ProductInfo/ProductDetailEditButton.client';

type Props = {
  id: string;
  canEdit: boolean;
  code?: string | null;
  newerProductId?: string | null;
  olderProductId?: string | null;
  viewCount?: number | null;
};

function formatViews(n: number | null | undefined): string {
  const v = typeof n === 'number' ? n : 0;
  if (!Number.isFinite(v) || v < 0) return '0';
  return new Intl.NumberFormat('tr-TR').format(Math.floor(v));
}

function toSafeInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return Math.floor(v);
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

export default function ProductDetailActions({
  id,
  canEdit,
  newerProductId = null,
  olderProductId = null,
  viewCount = null,
}: Props): React.JSX.Element {
  const newerHref = newerProductId
    ? (`/products/${encodeURIComponent(newerProductId)}` as unknown as Route)
    : null;

  const olderHref = olderProductId
    ? (`/products/${encodeURIComponent(olderProductId)}` as unknown as Route)
    : null;

  const showNav = Boolean(newerHref || olderHref);

  const [views, setViews] = React.useState<number | null>(() => (typeof viewCount === 'number' ? viewCount : null));

  React.useEffect(() => {
    let alive = true;

    // Aynı üründe spam artışı olmasın diye basit throttle (5 dk)
    const key = `pv:${id}`;
    const now = Date.now();
    const lastRaw = localStorage.getItem(key);
    const last = lastRaw ? Number.parseInt(lastRaw, 10) : 0;

    if (Number.isFinite(last) && last > 0 && now - last < 5 * 60 * 1000) {
      return () => {
        alive = false;
      };
    }

    localStorage.setItem(key, String(now));

    fetch(`/api/products/${encodeURIComponent(id)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const j: unknown = await r.json();
        return j;
      })
      .then((j) => {
        if (!alive || !j || typeof j !== 'object') return;
        const obj = j as { viewCount?: unknown };
        const n = toSafeInt(obj.viewCount);
        if (n !== null) setViews(n);
      })
      .catch(() => {
        // sessiz geç, sayaç “best-effort”
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const viewsText = formatViews(views);

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
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

      {canEdit ? (
        <>
          <Divider sx={{ opacity: 0.7 }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, overflow: 'hidden' }}>
              <VisibilityOutlinedIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                {viewsText}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'inline' } }}
              >
                görüntülenme
              </Typography>
            </Stack>

            <Box sx={{ flexShrink: 0 }}>
              <ProductDetailEditButton id={id} canEdit={canEdit} />
            </Box>
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}
