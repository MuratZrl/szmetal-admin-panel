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
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { alpha, useTheme } from '@mui/material/styles';

import HoverPreview from '@/features/products/components/HoverPreview.client';

import { withVersion } from '@/features/products/utils/url';
import { detectMediaKind } from '@/features/products/utils/media';

import type { Product } from '@/features/products/types';
import { useProductsSelection } from '@/features/products/selection/ProductsSelectionContext.client';
import type { LabelMaps } from '@/features/products/utils/labelMaps.server';

import { prettyTr } from '@/features/products/utils/tr-text';

type Props = { product: Product; labels?: LabelMaps };

/* ---------------- helpers ---------------- */
function svgPlaceholder4x3(opts: { bg: string; fg: string; text: string }): string {
  const { bg, fg, text } = opts;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 4 3" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${bg}"/></linearGradient></defs>
    <rect width="4" height="3" fill="url(#g)"/>
    <g fill="${fg}">
      <rect x="0.25" y="0.25" width="3.5" height="2.5" fill="none" stroke="${fg}" stroke-width="0.03" stroke-dasharray="0.12 0.12"/>
      <text x="2" y="1.55" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="0.32" font-weight="600">${text}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ProductCard({ product, labels }: Props) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { isSelected, toggle } = useProductsSelection();
  const selected = isSelected(product.id);

  const variantLabel  = prettyTr(product.variant,     labels?.variant);
  const categoryLabel = prettyTr(product.category,    labels?.category);
  const subLabel      = prettyTr(product.subCategory, labels?.subcategory);

  const versionedImage = withVersion(product.image ?? null, product.updatedAt ?? product.createdAt ?? null);

  const kind = detectMediaKind({
    url: versionedImage ?? undefined,
    mime: product.fileMime ?? undefined,
    extHint: product.fileExt ?? undefined,
  });

  const isPdf   = kind === 'pdf';
  const isImage = kind === 'image';
  
  const placeholderSrc = React.useMemo(() => {
    const bg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.grey[900], 0.6)
    : theme.palette.grey[100];
    const fg = theme.palette.mode === 'dark'
    ? theme.palette.grey[300]
    : theme.palette.text.secondary;
    return svgPlaceholder4x3({ bg, fg, text: isPdf ? 'PDF Önizleme' : 'Görsel yok' });
  }, [theme.palette.mode, theme.palette.grey, theme.palette.text, isPdf]);
  
  const [imgError, setImgError] = React.useState(false);
  const imageSrc = isImage ? String(versionedImage ?? '') : placeholderSrc;
  const hasPreview = (isPdf && !!versionedImage) || (isImage && !imgError);
  const finalImgSrc = imgError ? placeholderSrc : imageSrc;

  // Hover state + anchor
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const hoverTimers = React.useRef<{ close?: number }>({});

  // Medya alanı ölçüsü (görsel 1.45x için)
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
    // Mobilde hover saçmalığı olmasın
    if (!downSm) setHoverOpen(true);
  };

  const handleLeave = () => {
    hoverTimers.current.close = window.setTimeout(() => setHoverOpen(false), 100);
  };

  return (
    <Card
      variant="elevation"
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
          transition: 'outline-color .2s',
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
            aspectRatio: '4 / 3.25', // ≈ 0.707106...
            overflow: 'hidden',
            flex: '0 0 auto',
          }}
        >
        {isPdf && versionedImage ? (
          <Box sx={{ position: 'absolute', inset: 0, '& > iframe': { width: '100%', height: '100%', border: 0, display: 'block' } }}>
            <iframe
              src={`${versionedImage}#page=1&zoom=page-width&toolbar=0&navpanes=0&scrollbar=0`}
              title={`${product.name} PDF`}
              loading="lazy"
              style={{ pointerEvents: 'none' }}
            />
          </Box>
        ) : (
          <CardMedia
            // Not: Next/Image ile CardMedia kullanıyorsan 'image' prop'u Next/Image'a 'src' diye gitmez.
            // En güvenlisi component="img" kullanmak.
            component="img"
            image={finalImgSrc}
            alt={product.name || 'Ürün'}
            draggable={false}
            loading="lazy"
            onError={() => setImgError(true)}
            sx={{ position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'cover', bgcolor: 'background.default' }}
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

          <Stack
            direction="row"
            alignItems="center"
            sx={{ flexWrap: 'wrap', gap: 1, maxWidth: 1 }}
          >
            <Chip
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
              size="small"
              label={`${categoryLabel} / ${subLabel}`}
              variant="filled"
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

      {/* footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
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
          startIcon={<InfoOutlineIcon />}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          sx={{ px: 2 }}
        >
          Detaylar
        </Button>

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

      {/* HOVER PREVIEW: PDF sağda A4 tek sayfa, görsel 1.5x */}
      {!downSm && (
        <HoverPreview
          kind={isPdf ? 'pdf' : isImage ? 'image' : 'other'}
          open={hoverOpen && hasPreview}
          anchorEl={mediaBoxRef.current}
          src={isPdf ? String(versionedImage ?? '') : isImage ? finalImgSrc : undefined}
          baseSize={mediaRect}
          scale={1.8} // görsel preview daha da büyük
          pdfWidths={{ xs: 335, sm: 350, md: 375, lg: 425, xl: 460  }} // PDF preview daha da iri
        />
      )}
    </Card>
  );
}
