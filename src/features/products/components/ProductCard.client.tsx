// src/features/products/components/ProductCard.client.tsx
'use client';

import * as React from 'react';

import Link from 'next/link';

import {
  Card, CardActionArea, CardContent, CardMedia,
  Typography, Chip, Stack, Checkbox, Box, useMediaQuery, Button,
} from '@mui/material';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditIcon from '@mui/icons-material/Edit';

import { alpha, useTheme } from '@mui/material/styles';

import HoverPreview from '@/features/products/components/HoverPreview.client';
import { detectMediaKind } from '@/features/products/utils/media';
import type { Product } from '@/features/products/types';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';

import type { LabelMaps } from '@/features/products/services/labelMaps.server';

import { prettyTr } from '@/features/products/utils/tr-text';
import { humanizeSystemSlug, isSlugLike } from '@/utils/caseFilter';
import { productCanonicalPath, productEditPath } from '@/features/products/utils/url';

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
  const raw = prettyTr(value ?? '', map);
  return isSlugLike(raw) ? humanizeSystemSlug(raw) : raw;
}

export default function ProductCard({ product, labels, resolvedImageUrl, role }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  const normalizedRole = normalizeRole(role);
  const canSelect = normalizedRole !== 'User';
  const canEdit = normalizedRole === 'Admin' || normalizedRole === 'Manager';

  const variantLabel  = prettifyLabel(product.variant,     labels?.variant);
  const categoryLabel = prettifyLabel(product.category,    labels?.category);
  const subLabel      = prettifyLabel(product.subCategory, labels?.subcategory);

  // Tooltip/title için düz metin
  const categoryLine = React.useMemo(() => {
    return [categoryLabel, subLabel].filter(Boolean).join(' / ');
  }, [categoryLabel, subLabel]);

  // Ekranda ikonlu render için node dizisi
  const categoryNodes = React.useMemo(() => {
    const parts = [categoryLabel, subLabel].filter(Boolean);
    return parts.map((part, i) => (
      <React.Fragment key={`${part}-${i}`}>
        {i > 0 && (
          <ArrowForwardIosIcon
            fontSize="inherit"              // Typography boyutunu miras al
            sx={{ mx: 0.5, opacity: 0.6, verticalAlign: 'middle' }}
            aria-hidden
          />
        )}
        <span>{part}</span>
      </React.Fragment>
    ));
  }, [categoryLabel, subLabel]);

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

  const titleWidth = { xs: '100%', sm: 280 };

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

  // KANONİK DETAY LİNKİ: profileCode varsa onu kullan
  const detailHref = productCanonicalPath(product);
  const editHref = productEditPath(product);

  return (
    <Card
      variant="elevation"
      data-role={normalizedRole}
      data-can-select={canSelect ? 'true' : 'false'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 1.75,
        height: { xs: 'auto', md: '100%' },
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
            // PDF
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
            // Image
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
            minWidth: 0,                   // ← flex içinde ellipsis için şart
          }}
        >
          <Typography
            variant="subtitle1"
            component="p"
            lang="tr"
            title={`${product.code} • ${product.name}`}
            sx={{
              display: 'block',
              width: { xs: '100%', sm: 280 },   // eski titleWidth mantığı
              maxWidth: '100%',                 // Safari’de güvence
              minWidth: 0,                      // flex içinde zorunlu
              textAlign: 'start',               // “sağa yapışma” huyunu bırak
              lineHeight: 1.25,
              fontSize: { xs: '0.95rem', sm: '1rem' },

              // Wrapping: “…” yok, satıra kay
              whiteSpace: 'normal',
              overflowWrap: 'break-word',       // Safari destekli kırma
              wordBreak: 'break-word',          // WebKit legacy, iş görüyor
              hyphens: 'auto',

              // Aşırı uzun tek parça token’larda can simidi
              // (gerekirse aç, genelde yukarıdakiler yeter)
              '&': { wordBreak: 'break-word' },
            }}
          >
            {product.code} — {product.name}
          </Typography>

          <Stack direction="column"  my={0.25}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontWeight: (t) => t.typography.fontWeightBold }}
            >
              Birim Ağırlık: {product.unit_weight_g_pm} gr
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yapıldığı Tarih: {product.date}
            </Typography>
          </Stack>

          {!!categoryNodes.length && (
            <Box>
              <Chip
                size="small"
                variant="outlined"
                title={categoryLine}
                label={
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',        // ← flex değil
                      minWidth: 0,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                      fontWeight: '400',
                    }}
                  >
                    {categoryNodes}
                  </Box>
                }
                sx={(t) => ({
                  height: 24,
                  border: 0,
                  bgcolor: t.palette.surface[3],
                  color: t.palette.text.secondary,
                  maxWidth: titleWidth,               // ← responsive genişlik sınırı
                  minWidth: 0,                        // ← daralabilsin
                  '& .MuiChip-label': {
                    px: 0.75,
                    py: 0,
                    width: '100%',
                    minWidth: 0,                      // ← label da daralabilsin
                    overflow: 'hidden',               // ← taşanı gizle
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  },
                })}
              />
            </Box>
          )}

          {/* Varyant bilgisi ayrı, küçük bir chip olarak kalsın */}
          {!!variantLabel && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: 'block',
                width: titleWidth,
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

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          px: { xs: 1, sm: 1.5, md: 1.5 },
          py: { xs: 0.5, sm: 0.75 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: t => alpha(t.palette.background.paper, 0.9),
        }}
      >

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 36,
          }}
        >
          <Box>
            {canEdit && (
              <Button
                LinkComponent={Link}
                href={editHref}
                size="small"
                variant="outlined"
                endIcon={<EditIcon />}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                sx={{ px: 1.5 }}
                aria-label="Ürünü düzenle"
              >
                Hızlı Düzenle
              </Button>
            )}
          </Box>

          <Button
            LinkComponent={Link}
            href={detailHref}
            size="small"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            Profili İncele
          </Button>
        </Box>

        {canSelect && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minHeight: 32,
            }}
          >
            <Checkbox
              aria-label="Ürünü seç"
              size="small"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggle(product.id)}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<RadioButtonCheckedIcon />}
            />
          </Box>
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
