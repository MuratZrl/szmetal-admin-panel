// src/features/products/components/ui/ProductMedia.client.tsx
'use client';

import * as React from 'react';
import { Box, CardMedia, useMediaQuery } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

type PdfWidths = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

type HoverPreviewProps = {
  kind: 'pdf' | 'image' | 'other';
  open: boolean;
  anchorEl: HTMLElement | null;
  src?: string;
  baseSize?: { width: number; height: number } | null;
  scale?: number;
  pdfWidths?: PdfWidths;
};

type ProductMediaProps = {
  isPdf: boolean;
  isImage: boolean;
  displayUrl: string | null;
  productName: string;
  hoverScale?: number;
  pdfWidths?: PdfWidths;
  backgroundColor?: string;
  HoverPreviewComponent: React.ComponentType<HoverPreviewProps>;
};

/* Basit 4:3 placeholder SVG */
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

export function ProductMedia({
  isPdf,
  isImage,
  displayUrl,
  productName,
  hoverScale = 1.8,
  pdfWidths,
  backgroundColor,
  HoverPreviewComponent,
}: ProductMediaProps) {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

  const [imgError, setImgError] = React.useState(false);
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const hoverTimers = React.useRef<{ close?: number }>({});

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

  const bg = theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.6) : theme.palette.grey[100];
  const fg = theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.text.secondary;
  const placeholderSrc = svgPlaceholder4x3({ bg, fg, text: isPdf ? 'PDF Önizleme' : 'Görsel yok' });

  const imageSrc = isImage && displayUrl ? displayUrl : placeholderSrc;
  const hasPreview = (isPdf && !!displayUrl) || (isImage && !imgError);
  const finalImgSrc = imgError ? placeholderSrc : imageSrc;

  return (
    <>
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
          bgcolor: backgroundColor ?? 'background.default',
        }}
      >
        {isPdf && displayUrl ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              '& > iframe': {
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
                background: (t) => alpha(t.palette.background.default, 0.4),
              },
            }}
          >
            <iframe
              src={`${displayUrl}#page=1&view=fit&toolbar=0&navpanes=0`}
              title={`${productName} PDF`}
              loading="lazy"
              style={{ pointerEvents: 'none' }}
            />
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={finalImgSrc}
            alt={productName || 'Ürün'}
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

      {!downSm && (
        <HoverPreviewComponent
          kind={isPdf ? 'pdf' : isImage ? 'image' : 'other'}
          open={hoverOpen && hasPreview}
          anchorEl={mediaBoxRef.current}
          src={isPdf ? (displayUrl ?? undefined) : isImage ? finalImgSrc : undefined}
          baseSize={mediaRect}
          scale={hoverScale}
          pdfWidths={pdfWidths}
        />
      )}
    </>
  );
}
