// src/features/products/components/ProductCard.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Checkbox, Box, useMediaQuery, Button,
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { alpha, useTheme } from '@mui/material/styles';

import HoverPreview from '@/features/products/components/HoverPreview.client';
import { detectMediaKind } from '@/features/products/utils/media';
import type { Product } from '@/features/products/types';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import type { LabelMaps } from '@/features/products/services/labelMaps.server';
import { prettyTr } from '@/features/products/utils/tr-text';

import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';

type Role = 'Admin' | 'Manager' | 'User';

type Props = {
  product: Product;
  labels?: LabelMaps;
  /** Server’da üretilmiş imzalı URL veya public URL */
  resolvedImageUrl?: string | null;
  /** Kullanıcının rolü. Manager ise seçim gizlenir. */
  role?: Role | string | null;
};

/* ---------------- helpers ---------------- */
function svgPlaceholder4x3(opts: { bg: string; fg: string; text: string }): string {
  const { bg, fg, text } = opts;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="650" viewBox="0 0 4 3" preserveAspectRatio="xMidYMid slice">
    <rect width="4" height="3" fill="${bg}"/>
    <g fill="${fg}">
      <rect x="0.25" y="0.25" width="3.5" height="2.5" fill="none" stroke="${fg}" stroke-width="0.03" stroke-dasharray="0.12 0.12"/>
      <text x="2" y="1.55" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="0.32" font-weight="600">${text}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Rol değerini güvenli biçimde normalize eder. */
function normalizeRole(r: Props['role']): Role {
  const v = typeof r === 'string' ? r.trim().toLowerCase() : 'user';
  if (v === 'admin') return 'Admin';
  if (v === 'manager' || v === 'yönetici') return 'Manager';
  if (v === 'user' || v === 'kullanıcı') return 'User';
  return 'User';
}

function prettifyLabel(
  value: string | null | undefined,
  map?: Record<string, string> | undefined
): string {
  // prettyTr zaten string döndürüyor varsayımıyla:
  const raw = prettyTr(value ?? '', map);
  return isSlugLike(raw) ? humanizeSystemSlug(raw) : raw;
}

export default function ProductCard({ product, labels, resolvedImageUrl, role }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  const normalizedRole = normalizeRole(role);
  // HATA DÜZELTİLDİ: Burada yalnızca Manager ise seçim kapalı.
  const canSelect = normalizedRole !== 'Manager';

  const variantLabel  = prettifyLabel(product.variant,     labels?.variant);
  const categoryLabel = prettifyLabel(product.category,    labels?.category);
  const subLabel      = prettifyLabel(product.subCategory, labels?.subcategory);

  // 1) Eğer server'dan çözümlenmiş URL geldiyse onu kullan.
  // 2) Gelmediyse eski alanı deneriz ama path ise yine placeholder olur.
  const displayUrl =
    resolvedImageUrl ??
    (typeof product.image === 'string' && /^https?:\/\//i.test(product.image) ? product.image : null);

  const kind = detectMediaKind({
    url: displayUrl ?? undefined,
    mime: product.fileMime ?? undefined,
    extHint: product.fileExt ?? undefined,
  });

  const isPdf   = kind === 'pdf';
  const isImage = kind === 'image';

  const placeholderSrc = React.useMemo(() => {
    const bg = theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.6) : theme.palette.grey[100];
    const fg = theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.text.secondary;
    return svgPlaceholder4x3({ bg, fg, text: isPdf ? 'PDF Önizleme' : 'Görsel yok' });
  }, [theme.palette.mode, theme.palette.grey, theme.palette.text, isPdf]);

  const [imgError, setImgError] = React.useState(false);
  const imageSrc = isImage && displayUrl ? displayUrl : placeholderSrc;
  const hasPreview = (isPdf && !!displayUrl) || (isImage && !imgError);
  const finalImgSrc = imgError ? placeholderSrc : imageSrc;

  // Hover state + anchor
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const hoverTimers = React.useRef<{ close?: number }>({});

  // Media rect
  const [mediaRect, setMediaRect] = React.useState<{ width: number; height: number } | null>(null);
  const mediaBoxRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!mediaBoxRef.current) return;
    const el = mediaBoxRef.current;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setMediaRect({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleEnter = () => {
    if (hoverTimers.current.close) {
      window.clearTimeout(hoverTimers.current.close);
      hoverTimers.current.close = undefined;
    }
    if (!downSm) setHoverOpen(true);
  };

  const handleLeave = () => {
    hoverTimers.current.close = window.setTimeout(() => setHoverOpen(false), 100);
  };

  return (
    <Card
      variant="elevation"
      data-role={normalizedRole}
      data-can-select={canSelect ? 'true' : 'false'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 1.5,
        height: { xs: 'auto', md: '100%' },
      }}
    >
      <CardActionArea
        LinkComponent={Link}
        href={`/products/${product.id}`}
        draggable={false}
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 0,
          borderRadius: 0,
        }}
      >
        {/* Media area */}
        <Box
          ref={mediaBoxRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3.25',
            overflow: 'hidden',
            flex: '0 0 auto',
            bgcolor: 'background.default',
          }}
        >
          {isPdf && displayUrl ? (
            // PDF: tüm sayfayı çerçeve içine "sığdır" (zoom/view parametreleri)
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                '& > iframe': {
                  width: '100%',
                  height: '100%',
                  border: 0,
                  display: 'block',
                },
              }}
            >
              <iframe
                src={`${displayUrl}#page=1&view=fit&toolbar=0&navpanes=0`}
                title={`${product.name} PDF`}
                loading="lazy"
                style={{ pointerEvents: 'none' }}
              />
            </Box>
          ) : (
            // Görsel: kırpma yok, contain ile letterbox/pillarbox
            <CardMedia
              component="img"
              image={finalImgSrc}
              alt={product.name || 'Ürün'}
              draggable={false}
              loading="lazy"
              onError={() => setImgError(true)}
              sx={{
                position: 'absolute',
                inset: 0,
                width: 1,
                height: 1,
                objectFit: 'contain',
                objectPosition: 'center',
                bgcolor: 'background.default',
                imageRendering: 'auto',
              }}
            />
          )}
        </Box>

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            gap: 0.75,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            width: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            title={`${product.code} • ${product.name}`}
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              lineHeight: 1.25,
              fontSize: { xs: '0.95rem', sm: '1rem' },
            }}
          >
            {product.code} — {product.name}
          </Typography>

          <Stack direction="column" spacing={0.25} my={0.5}>
            <Typography variant="caption" color="text.secondary">
              Birim Ağırlık: {product.unit_weight_g_pm} gr
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tarih: {product.date}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, maxWidth: 1 }}>
            <Chip
              variant="outlined"
              size="small"
              label={`${variantLabel} Profilleri`}
              sx={{
                textTransform: 'none',
                maxWidth: 1,
                height: 'auto',
                alignItems: 'flex-start',
                '& .MuiChip-label': {
                  display: 'block',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  py: 0.25,
                },
              }}
            />
            <Chip
              variant="outlined"
              size="small"
              label={`${categoryLabel} / ${subLabel}`}
              sx={{
                textTransform: 'none',
                maxWidth: 1,
                height: 'auto',
                alignItems: 'flex-start',
                '& .MuiChip-label': {
                  display: 'block',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  py: 0.25,
                },
              }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>

      <Box
        component="footer"
        sx={{
          display: 'flex',
          justifyContent: canSelect ? 'space-between' : 'flex-end',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1, sm: 1.5, md: 1.5 },
          py: { xs: 0.5, sm: 0.75 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: t => alpha(t.palette.background.paper, 0.9),
        }}
      >
        <Button
          LinkComponent={Link}
          href={`/products/${product.id}`}
          size="small"
          variant="text"
          startIcon={<InfoOutlinedIcon />}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          sx={{ px: 2 }}
        >
          Detaylar
        </Button>

        {canSelect && (
          <Checkbox
            aria-label="Ürünü seç"
            size="small"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggle(product.id)}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<RadioButtonCheckedIcon />}
          />
        )}
      </Box>

      {!downSm && (
        <HoverPreview
          kind={isPdf ? 'pdf' : isImage ? 'image' : 'other'}
          open={hoverOpen && hasPreview}
          anchorEl={mediaBoxRef.current}
          src={isPdf ? (displayUrl ?? undefined) : isImage ? finalImgSrc : undefined}
          baseSize={mediaRect}
          scale={1.8}
          pdfWidths={{ xs: 335, sm: 350, md: 375, lg: 425, xl: 460 }}
        />
      )}
    </Card>
  );
}
