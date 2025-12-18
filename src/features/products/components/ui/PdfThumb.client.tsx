// src/features/products/components/ui/PdfThumb.client.tsx
'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

type Size = { width: number; height: number };
type Props = { src: string; boxSize: Size | null; title?: string };
type PageDims = { width: number; height: number };

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/api/pdf-worker';
}

export default function PdfThumb({ src, boxSize, title }: Props): React.JSX.Element {
  const [loadError, setLoadError] = React.useState(false);
  const [pageDims, setPageDims] = React.useState<PageDims | null>(null);

  const aliveRef = React.useRef(true);
  React.useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    setLoadError(false);
    setPageDims(null);
  }, [src]);

  const ready =
    !!boxSize && boxSize.width > 8 && boxSize.height > 8 && !loadError;

  const fitScale = React.useMemo(() => {
    if (!boxSize || !pageDims) return 1;
    const s = Math.min(boxSize.width / pageDims.width, boxSize.height / pageDims.height);
    return Math.max(0.1, Math.min(s, 4));
  }, [boxSize, pageDims]);

  const bg = '#fff';

  if (!ready) {
    return <Box sx={{ position: 'absolute', inset: 0, bgcolor: bg }} title={title} />;
  }

  return (
    <Box
      title={title}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg,
        overflow: 'hidden',
        pointerEvents: 'none',
        '& .react-pdf__Page__canvas': {
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          backgroundColor: bg,
        },
      }}
    >
      <Document
        key={src}
        file={src}
        onLoadError={() => aliveRef.current && setLoadError(true)}
        onSourceError={() => aliveRef.current && setLoadError(true)}
        loading={null}
        error={null}
      >
        <Page
          pageNumber={1}
          scale={fitScale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onLoadSuccess={(page) => {
            if (!aliveRef.current) return;
            const vp = page.getViewport({ scale: 1 });
            setPageDims({ width: vp.width, height: vp.height });
          }}
        />
      </Document>
    </Box>
  );
}
