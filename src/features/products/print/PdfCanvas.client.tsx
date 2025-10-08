// src/features/products/components/PdfCanvas.client.tsx
'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';

type PdfViewport = { width: number; height: number };
type PdfRenderTask = { promise: Promise<void> };
type PdfPage = {
  getViewport: (opts: { scale: number }) => PdfViewport;
  render: (opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
    transform?: [number, number, number, number, number, number];
    intent?: 'print' | 'display';
  }) => PdfRenderTask;
};
type PdfDocument = { getPage: (n: number) => Promise<PdfPage> };
type PdfJs = {
  GlobalWorkerOptions: { workerPort?: Worker; workerSrc?: string };
  getDocument: (opts: { url: string; withCredentials?: boolean }) => { promise: Promise<PdfDocument> };
};

type Props = { url: string; fit?: 'contain' | 'cover'; onReady?: () => void };

export default function PdfCanvas({ url, fit = 'contain', onReady }: Props) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [printDataUrl, setPrintDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjs = (await import('pdfjs-dist')) as unknown as PdfJs;

        try {
          pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.mjs', { type: 'module' });
        } catch {
          try { pdfjs.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.js'); }
          catch { pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'; }
        }

        const pdf = await pdfjs.getDocument({ url, withCredentials: true }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;

        const rect = wrap.getBoundingClientRect();
        const boxW = rect.width;
        const boxH = rect.height;

        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const vp1 = page.getViewport({ scale: 1 });
        const scale = fit === 'cover'
          ? Math.max(boxW / vp1.width, boxH / vp1.height)
          : Math.min(boxW / vp1.width, boxH / vp1.height);

        const vp = page.getViewport({ scale });

        canvas.width = Math.ceil(vp.width * dpr);
        canvas.height = Math.ceil(vp.height * dpr);
        canvas.style.width = `${vp.width}px`;
        canvas.style.height = `${vp.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context alınamadı');

        await page.render({
          canvasContext: ctx,
          viewport: vp,
          transform: [dpr, 0, 0, dpr, 0, 0],
          intent: 'print',
        }).promise;

        // Print için sağlam kopya
        try {
          const data = canvas.toDataURL('image/png'); // transparan alanlar beyaz kalır
          if (!cancelled) setPrintDataUrl(data);
        } catch {
          // bazı cihazlarda toDataURL başarısız olabilir, sorun değil
        }

        if (!cancelled) onReady?.();
      } catch (e) {
        if (!cancelled) setErr((e as Error).message || 'PDF çizilemedi');
      }
    }

    render();
    return () => { cancelled = true; };
  }, [url, fit, onReady]);

  return (
    <Box
      ref={wrapRef}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fff',
        zIndex: 1,
      }}
    >
      {/* Ekranda canvas, yazdırmada img */}
      {err ? (
        <Typography variant="body2" color="error" sx={{ p: 2 }}>PDF yüklenemedi: {err}</Typography>
      ) : (
        <>
          <canvas ref={canvasRef} />
          {printDataUrl ? (
            <Box
              component="img"
              src={printDataUrl}
              alt="PDF sayfası"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'none',        // ekranda gizli
              }}
              className="pdf-print-img"
            />
          ) : null}
          <style jsx global>{`
            @media print {
              /* ekranda görünen canvas'ı yazdırmada gizle, PNG'i göster */
              canvas { display: none !important; }
              .pdf-print-img { display: block !important; }
            }
          `}</style>
        </>
      )}
    </Box>
  );
}
