'use client';
// src/features/products/components/ui/ProductCard.client.tsx

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
import { VariantCaption } from '@/features/products/components/ui/ProductCard/ProductCardVariantCaptionclient';
import { ProductActions } from '@/features/products/components/ui/ProductCard/ProductCardActions.client';

import type { Product } from '@/features/products/types';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  product: Product;
  labels?: LabelMaps;
  resolvedImageUrl?: string | null;
  role?: Role | string | null;
};

const PDF_WIDTHS = {
  xs: 335,
  sm: 350,
  md: 375,
  lg: 425,
  xl: 460,
} as const;

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

function formatGrPerMeter(gPerMeter: number | null | undefined): string {
  const n = typeof gPerMeter === 'number' ? gPerMeter : 0;
  if (!Number.isFinite(n) || n <= 0) return '0 gr/m';
  return `${Math.round(n)} gr/m`;
}

function ProductCard({ product, labels, resolvedImageUrl, role }: Props) {
  const theme = useTheme();

  const normalizedRole = normalizeRole(role);
  const canEdit = normalizedRole === 'Admin' || normalizedRole === 'Manager';

  const isCustomerMold = product.hasCustomerMold === true;

  const customerMoldColor =
    theme.palette.mode === 'dark'
      ? theme.palette.warning.light
      : theme.palette.warning.dark;

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

  const displayUrl = React.useMemo(() => {
    if (resolvedImageUrl !== null && resolvedImageUrl !== undefined) {
      return resolvedImageUrl;
    }
    if (typeof product.image === 'string' && /^https?:\/\//i.test(product.image)) {
      return product.image;
    }
    return null;
  }, [resolvedImageUrl, product.image]);

  const kind = React.useMemo(
    () =>
      detectMediaKind({
        url: displayUrl ?? undefined,
        mime: product.fileMime ?? undefined,
        extHint: product.fileExt ?? undefined,
      }),
    [displayUrl, product.fileMime, product.fileExt],
  );

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
        borderRadius: 3,
        height: { xs: 'auto', md: '100%' },

        // ✅ Kartın genişliği artık layout’tan gelsin
        width: '100%',
        maxWidth: '100%',

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
          pdfWidths={PDF_WIDTHS}
          backgroundColor="#fff"   // ✅ her zaman beyaz
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
            {product.code} — {product.name}
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
            />
          )}

          <VariantCaption variant={product.variant} variantMap={labels?.variant} />

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

function areProductCardPropsEqual(prev: Props, next: Props): boolean {
  if (prev === next) return true;
  if (prev.role !== next.role) return false;
  if (prev.resolvedImageUrl !== next.resolvedImageUrl) return false;
  if (prev.labels !== next.labels) return false;

  const p = prev.product;
  const n = next.product;
  if (p === n) return true;

  return (
    p.id === n.id &&
    p.name === n.name &&
    p.code === n.code &&
    p.hasCustomerMold === n.hasCustomerMold &&
    p.unit_weight_g_pm === n.unit_weight_g_pm &&
    p.date === n.date &&
    p.createdAt === n.createdAt &&
    p.variant === n.variant &&
    p.category === n.category &&
    p.subCategory === n.subCategory &&
    p.image === n.image &&
    p.fileMime === n.fileMime &&
    p.fileExt === n.fileExt
  );
}

export default React.memo(ProductCard, areProductCardPropsEqual);
