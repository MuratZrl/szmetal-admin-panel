// src/features/products/components/PrintableProductSheet.client.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

import PdfCanvas from '@/features/products/print/PdfCanvas.client';

type Media = {
  url: string;
  ext: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mime: string | null;
};

type ProductSlim = {
  id: string;
  title: string;
  variant: string;
  category: string;
  subCategory?: string;
  date: string;
  revisionDate?: string | null;
  unit_weight_g_pm?: number;
  drawer?: string | null;
  control?: string | null;
  scale?: string | null;
  outerSizeMm?: number | null;
  sectionMm2?: number | null;
  tempCode?: string | null;
  profileCode?: string | null;
  manufacturerCode?: string | null;
  hasCustomerMold?: boolean | null;
  availability?: boolean | null;
  description?: string | null;
};

type Props = { product: ProductSlim; media: Media };

const fmt0 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const nf = (n?: number | null) => (typeof n === 'number' ? fmt0.format(n) : undefined);

const humanize = (raw?: string | null): string => {
  if (!raw) return '—';
  // - ve _ yerine boşluk; fazla boşlukları sıkıştır
  const s = String(raw).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Bazı kısaltmaları olduğu gibi bırak (isteğe göre genişlet)
  const KEEP_UPPER = new Set(['PVC', 'PP', 'PE', 'ABS', 'PC', 'PET', 'ISO', 'DIN']);

  return s
    .split(' ')
    .map(token => {
      const upper = token.toUpperCase();
      if (KEEP_UPPER.has(upper)) return upper;
      // Türkçe doğru harf dönüşümleri
      const first = token.charAt(0).toLocaleUpperCase('tr-TR');
      const rest  = token.slice(1).toLocaleLowerCase('tr-TR');
      return first + rest;
    })
    .join(' ');
};

function DetailsTable({
  rows,
}: {
  rows: Array<[label: string, value: React.ReactNode, label2?: string, value2?: React.ReactNode]>;
}) {
  return (
    <Table
      size="small"
      sx={{
        tableLayout: 'fixed',
        borderCollapse: 'collapse',

        // Tüm hücreler: daha küçük font, daha sıkı line-height ve DÜŞÜK dikey padding
        '& .MuiTableCell-root': {
          py: 0.25,             // ↓ 2px dikey padding
          px: 0.5,              // 4px yatay padding (istersen 0.75'e çekebilirsin)
          lineHeight: 1.1,
          fontSize: 11,
          color: '#000 !important',
          backgroundColor: '#fff !important',
          borderStyle: 'solid',
          borderColor: 'rgba(0,0,0,0.9)',
          borderWidth: '0.5px', // ↓ 1px yerine 0.5px; ekranda ve printte daha ince
        },

        // MUI'nin satır min yüksekliğini yok say
        '& .MuiTableRow-root': { height: 'auto' },

        // Başlık hücresi de sıkı olsun
        '& thead .MuiTableCell-root': {
          py: 0.25,
          fontWeight: 700,
        },

        // Sol ve üçüncü sütun (anahtarlar) sabit genişlikte, kırpmasız
        '& tbody th[scope="row"]': {
          width: '28%',
          whiteSpace: 'nowrap',
          color: '#333',
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell colSpan={4} sx={{ fontWeight: 700 }}>
            Ürün Bilgileri
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r, i) => {
          const [l1, v1, l2, v2] = r;
          return (
            <TableRow key={i}>
              <TableCell component="th" scope="row">{l1}</TableCell>
              <TableCell>{v1 ?? '—'}</TableCell>
              <TableCell component="th" scope="row">{l2 ?? ''}</TableCell>
              <TableCell>{v2 ?? (l2 ? '—' : '')}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}


export default function PrintableProductSheet({ product, media }: Props) {

  const rows: Array<[string, React.ReactNode, string?, React.ReactNode?]> = [];

  const mold = typeof product.hasCustomerMold === 'boolean' ? (product.hasCustomerMold ? 'Evet' : 'Hayır') : '—';
  const usage = product.availability == null ? '—' : product.availability ? 'Kullanılabilir' : 'Kullanılamaz';

  rows.push(['Kategori:', humanize(product.category), 'Alt Kategori:', humanize(product.subCategory)]);
  rows.push(['Varyant:', humanize(product.variant), 'Birim Ağırlık (gr/m):', nf(product.unit_weight_g_pm) ?? '—']);
  rows.push(['Kullanım Durumu:', usage, 'Müşteri Kalıbı:', mold]);
  rows.push(['Çizen:', product.drawer || '—', 'Kontrol:', product.control || '—']);
  rows.push(['Tarih:', product.date || '—', 'Revizyon Tarihi:', product.revisionDate || '—']);
  if (product.tempCode) rows.push(['Geçici Kod:', product.tempCode, 'Profil Kodu:', product.profileCode || '—']);
  if (product.manufacturerCode || product.scale)
    rows.push(['Üretici Kodu:', product.manufacturerCode || '—', 'Ölçek:', product.scale || '—']);
  if (typeof product.outerSizeMm === 'number' || typeof product.sectionMm2 === 'number')
    rows.push(['Dış Çevre (mm):', nf(product.outerSizeMm) ?? '—', 'Kesit (mm²):', nf(product.sectionMm2) ?? '—']);
  
  const mediaUrl = media.url;
  const isPdf = React.useMemo(() => {
    if (media.ext === 'pdf') return true;
    if ((media.mime ?? '').toLowerCase().includes('pdf')) return true;
    // Secure route URL’ünde query’de bile .pdf geçebilir, tüm stringi tara
    const u = (mediaUrl ?? '').toLowerCase();
    return u.includes('.pdf');
  }, [media.ext, media.mime, mediaUrl]);

  // Canvas veya img yüklendiğinde true olacak
  const [ready, setReady] = React.useState<boolean>(!isPdf);

  // YAZDIRMAYI sadece hazır olunca tetikle
  React.useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      try { window.focus(); window.print(); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <Box sx={{ p: 0, m: 0 }}>
      {/* Print izolasyonu ve light zorlaması */}
      <style jsx global>{`
        @page { size: A4; margin: 0; }
        :root { color-scheme: light; }
        @media print {
          html, body { background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000 !important; }

          /* Her şeyi gizle, sadece #print-root ağacını görünür yap */
          body * { visibility: hidden !important; }
          #print-root, #print-root * { visibility: visible !important; }

          /* Kökü sayfaya sabitle ki layout ataları görünmezken de ölçüler korunsun */
          #print-root { position: fixed; inset: 0; }
        }
      `}</style>

      {/* A4 tuval */}
      <Paper
        elevation={0}
        square
        sx={{
          width: '210mm',
          height: '297mm',
          m: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#fff',
          color: '#000',
          isolation: 'isolate', // kendi stacking context'i
          borderRadius: 0,
        }}
      >
        {/* Medya katmanı */}
        {isPdf ? (
          <PdfCanvas url={mediaUrl} fit="contain" onReady={() => setReady(true)} />
        ) : mediaUrl ? (
          <Box
            component="img"
            src={mediaUrl}
            alt={product.title}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              zIndex: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: '#000' }}>
              Medya bulunamadı
            </Typography>
          </Box>
        )}

        {/* Alt bilgi overlay */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              m: 2,
              px: 1.5,
              bgcolor: 'rgba(255, 255, 255, 1)',
              color: '#000',
            }}
          >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#000' }}>
            {product.title}
          </Typography>

          <DetailsTable rows={rows} />
          
          {product.description ? (
            <Typography variant="caption" sx={{ display: 'block', my: 1.25, color: '#000' }}>
              {product.description}
            </Typography>
          ) : null}

        </Box>
      </Paper>
    </Box>
  );
}
