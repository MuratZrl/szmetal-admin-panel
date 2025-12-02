// src/features/products/components/ui/ProductCard.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { detectMediaKind } from '@/features/products/utils/media';

import type { LabelMaps } from '@/features/products/services/labelMaps.server';

import HoverPreview from '@/features/products/components/HoverPreview.client';

// BUNU bırakıyoruz
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';

import { ProductMedia } from '@/features/products/components/ui/ProductCard/ProductCardMedia.client';
import { CategoryChip } from '@/features/products/components/ui/ProductCard/ProductCardCategoryTag.client';
import { ProductActions } from '@/features/products/components/ui/ProductCard/ProductCardActions.client';

import type { Product } from '@/features/products/types';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  product: Product;
  labels?: LabelMaps;
  resolvedImageUrl?: string | null;
  role?: Role | string | null;
};

function normalizeRole(r: Props['role']): Role {
  const v = typeof r === 'string' ? r.trim().toLowerCase() : 'user';
  if (v === 'admin') return 'Admin';
  if (v === 'manager' || v === 'yönetici') return 'Manager';
  if (v === 'user' || v === 'kullanıcı') return 'User';
  return 'User';
}

/** Ortak: DB value + labelMap → gösterilecek etiket */
function resolveLabelFromMap(
  value: string | null | undefined,
  map?: Record<string, string>,
): string {
  const key = (value ?? '').trim();
  if (!key) return '';

  const fromMap = map?.[key];
  if (fromMap && fromMap.trim()) {
    return fromMap.trim();
  }

  // Map'te yoksa slug'ı insanileştir, o da değilse raw göster
  if (isSlugLike(key)) {
    return humanizeSystemSlug(key);
  }

  return key;
}

function formatGrPerMeter(gPerMeter: number | 0): string {
  const n = Number(gPerMeter);
  if (!Number.isFinite(n) || n <= 0) return '0 gr/m';
  const int = Math.round(n);
  return `${int} gr/m`;
}

export default function ProductCard({ product, labels, resolvedImageUrl, role }: Props) {
  const theme = useTheme();

  const normalizedRole = normalizeRole(role);
  const canEdit = normalizedRole === 'Admin' || normalizedRole === 'Manager';

  const isCustomerMold = product.hasCustomerMold === true;

  const customerMoldColor =
    theme.palette.mode === 'dark'
      ? theme.palette.warning.light
      : theme.palette.warning.dark;

  // Varyant: products.variant = key, labels.variant[key] = name
  const variantLabel = resolveLabelFromMap(product.variant, labels?.variant).trim();
  const showVariantCaption = React.useMemo(() => {
    const raw = String(product.variant ?? '').trim().toLowerCase();
    if (!raw || raw === 'none' || raw === 'yok') return false;
    const lbl = variantLabel.toLowerCase();
    if (!lbl || lbl === 'none' || lbl === 'yok') return false;
    return true;
  }, [product.variant, variantLabel]);

  const createdDate =
    typeof product.createdAt === 'string' && product.createdAt
      ? product.createdAt.slice(0, 10)
      : null;

  /**
   * Kategori breadcrumb:
   *   - Biz leaf slug’ı product.subCategory’de tutuyoruz (products.server.ts’te override ettin).
   *   - LabelMaps.categoryPathBySlug[leafSlug] -> ['Root', 'Alt', 'Leaf'] veriyor.
   *   - Eğer map’te yoksa, en azından tek label üretmeye çalışıyoruz.
   */
  const categoryPathLabels = React.useMemo(() => {
    const leafSlug = String(product.subCategory ?? product.category ?? '').trim();
    if (!leafSlug) return [] as string[];

    // Öncelik: hazır path map’i
    const path = labels?.categoryPathBySlug?.[leafSlug];
    if (path && path.length > 0) {
      return path;
    }

    // Fallback: hiç bulamazsak tek label üret
    const mergedMap: Record<string, string> = {
      ...(labels?.category ?? {}),
      ...(labels?.subcategory ?? {}),
    };
    const single = resolveLabelFromMap(leafSlug, mergedMap);
    return single ? [single] : [];
  }, [labels, product.category, product.subCategory]);

  const categoryTitle =
    categoryPathLabels.length > 0 ? categoryPathLabels.join(' / ') : undefined;

  const displayUrl =
    resolvedImageUrl ??
    (typeof product.image === 'string' && /^https?:\/\//i.test(product.image)
      ? product.image
      : null);

  const kind = detectMediaKind({
    url: displayUrl ?? undefined,
    mime: product.fileMime ?? undefined,
    extHint: product.fileExt ?? undefined,
  });

  const isPdf = kind === 'pdf';
  const isImage = kind === 'image';

  // Artık uuid id üzerinden routing
  const detailHref = `/products/${encodeURIComponent(
    product.id,
  )}` as `/products/${string}`;
  const editHref = `/products/${encodeURIComponent(
    product.id,
  )}/edit` as `/products/${string}`;

  return (
    <Card
      variant="elevation"
      data-role={normalizedRole}
      data-customer-mold={isCustomerMold ? 'true' : 'false'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 1.75,
        height: { xs: 'auto', md: '100%' },
        transition:
          'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
      }}
    >
      <CardActionArea
        LinkComponent={Link}
        href={detailHref}
        draggable={false}
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 0,
          borderRadius: 0,
          position: 'relative',
        }}
      >
        <ProductMedia
          isPdf={isPdf}
          isImage={isImage}
          productName={product.name || 'Ürün'}
          displayUrl={displayUrl ?? null}
          hoverScale={1.8}
          pdfWidths={{ xs: 335, sm: 350, md: 375, lg: 425, xl: 460 }}
          backgroundColor={theme.palette.background.default}
          HoverPreviewComponent={HoverPreview}
        />

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            gap: 0.75,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            width: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            component="p"
            lang="tr"
            title={`${product.code} • ${product.name}`}
            sx={{
              display: 'block',
              width: { xs: '100%', sm: 280 },
              maxWidth: '100%',
              minWidth: 0,
              textAlign: 'start',
              lineHeight: 1.25,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {product.code} {product.name}
          </Typography>

          {isCustomerMold && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.3,
                color: customerMoldColor,
              }}
            >
              Müşteri Kalıbı Profili
            </Typography>
          )}

          <Stack direction="column" my={0.25}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: (t) => t.typography.fontWeightBold }}
            >
              Birim Ağırlık: {formatGrPerMeter(product.unit_weight_g_pm)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Çizildiği Tarih: {product.date}
            </Typography>

            {createdDate && (
              <Typography variant="caption" color="text.secondary">
                Eklenme Tarihi: {createdDate}
              </Typography>
            )}
          </Stack>

          {categoryPathLabels.length > 0 && (
            <CategoryChip
              segments={categoryPathLabels}
              title={categoryTitle}
              maxWidth={{ xs: '100%', sm: 280 }}
            />
          )}

          {showVariantCaption && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: 'block',
                width: { xs: '100%', sm: 280 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={`${variantLabel} Profilleri`}
            >
              {`${variantLabel} Profilleri`}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1, sm: 1.5, md: 1.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
          backdropFilter: 'saturate(110%) blur(1.5px)',
        }}
      >
        <ProductActions
          canEdit={canEdit}
          editHref={editHref}
          detailHref={detailHref}
        />
      </Box>
    </Card>
  );
}
