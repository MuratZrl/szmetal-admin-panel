// src/features/products/components/PDFpreview.client.tsx
'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

type Props = {
  file: string;   // public URL
  width: number;  // px
  height: number; // px (sadece kapsayıcıda kullanıyoruz)
};

// Worker yolunu güvenli şekilde ayarla
function ensureWorker() {
  // Next.js altında basePath vs varsa, origin’le çöz
  const src =
    typeof window !== 'undefined'
      ? new URL('/pdf.worker.js', window.location.origin).toString()
      : '/pdf.worker.js';

  if (pdfjs.GlobalWorkerOptions.workerSrc !== src) {
    pdfjs.GlobalWorkerOptions.workerSrc = src;
  }
}

export default function PdfPreview({ file, width, height }: Props) {
  const [broken, setBroken] = React.useState(false);

  React.useEffect(() => {
    ensureWorker();
  }, []);

  // Yeni dosyada resetle
  React.useEffect(() => {
    setBroken(false);
  }, [file]);

  if (broken) {
    // React-PDF patlarsa basit bir iframe fallback’i
    return (
      <Box
        component="iframe"
        src={`${file}#toolbar=0&view=FitH`}
        title="pdf-preview"
        sx={{ width, height, border: 0, display: 'block' }}
      />
    );
  }

  return (
    <Box sx={{ width, height, position: 'relative' }}>
      <Document
        file={{ url: file }} // Supabase public URL için yeterli
        onLoadError={(e) => {
          console.error('react-pdf load error', e);
          setBroken(true);
        }}
        onSourceError={(e) => {
          console.error('react-pdf source error', e);
          setBroken(true);
        }}
        loading={null}
        error={null}
        renderMode="canvas"
        // Önemli: worker’ın network isteklerine CORS izin verilmeli (Supabase defaultta veriyor)
      >
        <Page
          pageNumber={1}
          width={Math.max(1, Math.floor(width))}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </Box>
  );
}
