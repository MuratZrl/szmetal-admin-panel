'use client';
// src/features/products/components/HoverPreview.client.tsx

import * as React from 'react';
import { Popper, Paper, Box } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

type Kind = 'pdf' | 'image' | 'other';

type BreakWidths = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

type HoverPreviewProps = {
  kind: Kind;
  open: boolean;
  anchorEl: HTMLElement | null;
  src?: string | null;
  baseSize?: { width: number; height: number } | null;
  scale?: number;
  pdfWidths?: BreakWidths;
};

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/api/pdf-worker';
}

const PDF_OPTIONS = { disableRange: true, disableStream: true } as const;

export default function HoverPreview({
  kind,
  open,
  anchorEl,
  src,
  baseSize,
  scale = 2,
  pdfWidths,
}: HoverPreviewProps) {
  const [pageDims, setPageDims] = React.useState<{ width: number; height: number } | null>(null);

  // Reset page dims when src changes
  React.useEffect(() => {
    setPageDims(null);
  }, [src]);

  const isPdf = kind === 'pdf';
  const isImage = kind === 'image';

  const pdfMdWidth = pdfWidths?.md ?? 600;

  // Compute scale to fit the PDF page into the preview box
  const pdfScale = React.useMemo(() => {
    if (!pageDims) return 1.5;
    const targetW = pdfMdWidth;
    const targetH = targetW * (297 / 210); // A4 ratio
    const s = Math.min(targetW / pageDims.width, targetH / pageDims.height);
    return Math.max(0.1, Math.min(s, 4));
  }, [pageDims, pdfMdWidth]);

  if (!open || !anchorEl || !src) return null;

  const imgWidth = baseSize ? Math.round(baseSize.width * scale) : 540;
  const imgHeight = baseSize ? Math.round(baseSize.height * scale) : 405;

  const pdfW = {
    xs: pdfWidths?.xs ?? 360,
    sm: pdfWidths?.sm ?? 480,
    md: pdfMdWidth,
    lg: pdfWidths?.lg ?? 720,
    xl: pdfWidths?.xl ?? 820,
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={isPdf ? 'left-start' : 'right-start'}
      modifiers={[
        { name: 'offset', options: { offset: isPdf ? [0, 16] : [0, 12] } },
        { name: 'preventOverflow', options: { padding: 8, boundary: 'viewport' } },
        { name: 'computeStyles', options: { gpuAcceleration: false } },
        { name: 'flip', options: { padding: 8 } },
      ]}
      style={{ zIndex: 1300, pointerEvents: 'none' }}
    >
      <Paper elevation={8} sx={{ p: 0, overflow: 'hidden', borderRadius: 0.75 }}>
        {isPdf ? (
          <Box
            sx={{
              width: pdfW,
              aspectRatio: '210 / 297',
              bgcolor: '#fff',
              position: 'relative',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              '& .react-pdf__Page__canvas': {
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: 'block',
                pointerEvents: 'none',
              },
            }}
          >
            <Document
              key={src}
              file={src}
              options={PDF_OPTIONS}
              loading={null}
              error={null}
            >
              <Page
                pageNumber={1}
                scale={pdfScale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  const vp = page.getViewport({ scale: 1 });
                  setPageDims({ width: vp.width, height: vp.height });
                }}
              />
            </Document>
          </Box>
        ) : isImage ? (
          <Box
            sx={{
              width: imgWidth,
              height: imgHeight,
              position: 'relative',
              bgcolor: 'background.default',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            <Box
              component="img"
              src={src}
              alt="Önizleme"
              loading="lazy"
              draggable={false}
              sx={{ position: 'absolute', inset: 0, width: 1, height: 1, objectFit: 'cover' }}
            />
          </Box>
        ) : null}
      </Paper>
    </Popper>
  );
}
