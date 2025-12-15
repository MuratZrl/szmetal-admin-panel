// src/features/products/components/ui/PdfThumb.client.tsx
'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Document, Page, pdfjs } from 'react-pdf';

type Size = { width: number; height: number };
type Props = { src: string; boxSize: Size | null; title?: string };
type PageDims = { width: number; height: number };

// Worker artık Next route’tan geliyor. 404 olmaz.
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/api/pdf-worker';
}

export default function PdfThumb({ src, boxSize, title }: Props): React.JSX.Element {
  const theme = useTheme();

  const [loadError, setLoadError] = React.useState(false);
  const [pageDims, setPageDims] = React.useState<PageDims | null>(null);

  React.useEffect(() => {
    setLoadError(false);
  }, [src]);

  const file = React.useMemo(() => ({ url: src }), [src]);

  const fitScale = React.useMemo(() => {
    if (!boxSize || !pageDims) return 1;
    const s = Math.min(boxSize.width / pageDims.width, boxSize.height / pageDims.height);
    return Math.max(0.1, Math.min(s, 4));
  }, [boxSize, pageDims]);

  const bg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[900], 0.35)
      : theme.palette.grey[100];

  if (loadError) {
    return <Box sx={{ position: 'absolute', inset: 0, bgcolor: bg }} title={title} />;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg,
        overflow: 'hidden',
        pointerEvents: 'none',
        '& .react-pdf__Page': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& .react-pdf__Page__canvas': {
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
        },
      }}
      title={title}
    >
      <Document
        key={src}
        file={file}
        onLoadError={() => setLoadError(true)}
        loading={null}
        error={null}
      >
        <Page
          pageNumber={1}
          scale={fitScale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onLoadSuccess={(page) => {
            const vp = page.getViewport({ scale: 1 });
            setPageDims({ width: vp.width, height: vp.height });
          }}
        />
      </Document>
    </Box>
  );
}
