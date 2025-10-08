// app/(admin)/products/[id]/print/page.tsx
import { notFound } from 'next/navigation';
import { Box } from '@mui/material';

import { fetchProductById } from '@/features/products/services/products.server';
import { mapRowToProduct } from '@/features/products/types';

/* --------------- Client bileşeni importu --------------- */
// Next.js App Router'da server dosyasında client bileşeni import edebilirsin:
import PrintableProductSheet from '@/features/products/print/PrintableProductSheet.client';
import PrintHeader from '@/features/products/print/PrintHeader.client';

const PRODUCT_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

type Props = { params: Promise<{ id: string }> };

function toSecureUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  if (/^https?:\/\//i.test(storageKey)) return storageKey;

  const key = storageKey.startsWith(PRODUCT_BUCKET + '/')
    ? storageKey.slice(PRODUCT_BUCKET.length + 1)
    : storageKey;

  return `/api/products/storage?bucket=${encodeURIComponent(PRODUCT_BUCKET)}&path=${encodeURIComponent(key)}`;
}

function ensureInline(u: string | null): string {
  if (!u) return '';
  const url = new URL(u, 'http://localhost');
  if (u.startsWith('/api/products/storage')) {
    url.searchParams.set('disposition', 'inline');
  }
  return u.startsWith('/') ? url.pathname + (url.search || '') + (url.hash || '') : url.toString();
}

function looksPdf(ext?: string | null, mime?: string | null, url?: string | null): boolean {
  const e = (ext ?? '').toLowerCase();
  const m = (mime ?? '').toLowerCase();
  const u = (url ?? '').toLowerCase();
  return e === 'pdf' || m.includes('pdf') || u.includes('.pdf');
}

function ensureAttachment(u: string | null): string | null {
  if (!u) return null;
  const url = new URL(u, 'http://localhost');
  if (u.startsWith('/api/products/storage')) {
    url.searchParams.set('disposition', 'attachment');
  }
  return u.startsWith('/') ? url.pathname + (url.search || '') + (url.hash || '') : url.toString();
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const row = await fetchProductById(id);
  if (!row) notFound();

  const p = mapRowToProduct(row);

  const title = `${p.code} — ${p.name}`;

  // Medya seçimi: öncelik PDF ise filePath
  const preferPdf = (p.fileExt ?? '').toLowerCase() === 'pdf' && !!p.filePath;
  const rawPrimary = preferPdf ? p.filePath : p.image;
  const rawSecondary = preferPdf ? p.image : p.filePath;

  const basePrimary = toSecureUrl(rawPrimary);
  const baseSecondary = toSecureUrl(rawSecondary);

  const allowed = ['pdf', 'png', 'webp', 'jpg', 'jpeg'] as const;
  type AllowedExt = typeof allowed[number];
  const extLower = (p.fileExt ?? '').toLowerCase();
  const mediaExt: AllowedExt | null = (allowed as readonly string[]).includes(extLower) ? (extLower as AllowedExt) : null;

  const mediaSrc = ensureInline(basePrimary) || '';
  const mediaFallback = ensureInline(baseSecondary) || '';

  // Hangi URL gerçekten PDF? ext, mime VE/VEYA URL’e bak
  const primaryIsPdf = looksPdf(p.fileExt, p.fileMime, basePrimary);
  const secondaryIsPdf = looksPdf(undefined, undefined, baseSecondary);

  const pdfSource = primaryIsPdf ? basePrimary : (secondaryIsPdf ? baseSecondary : null);
  const pdfHref: string | null = pdfSource ? ensureAttachment(pdfSource) : null;

  return (
    <>
      {/* Ekran üst barı (print'te görünmeyecek) */}
      <PrintHeader title={title} pdfHref={pdfHref} />

      {/* Sadece print çıktısında görünür ağaç */}
      <div id="print-root">
        <Box sx={{ p: 0, m: 0 }}>
          <PrintableProductSheet
            product={{
              id: String(p.id),
              title,
              variant: p.variant,
              category: p.category,
              subCategory: p.subCategory ?? undefined,
              date: p.date,
              revisionDate: p.revisionDate || '',
              unit_weight_g_pm: typeof p.unit_weight_g_pm === 'number' ? p.unit_weight_g_pm : undefined,
              drawer: p.drawer,
              control: p.control,
              scale: p.scale,
              outerSizeMm: p.outerSizeMm ?? undefined,
              sectionMm2: p.sectionMm2 ?? undefined,
              tempCode: p.tempCode ?? undefined,
              profileCode: p.profileCode ?? undefined,
              manufacturerCode: p.manufacturerCode ?? undefined,
              hasCustomerMold: p.hasCustomerMold ?? row.has_customer_mold ?? null,
              availability: p.availability ?? null,
              description: p.description ?? '',
            }}
            media={{ url: mediaSrc || mediaFallback, ext: mediaExt, mime: p.fileMime ?? null }}
          />
        </Box>
      </div>
    </>
  );
}