'use client';
// src/features/products/components/ProductInfo/mediaActions.client.ts

import * as React from 'react';
import { detectMediaKind } from '@/features/products/utils/media';

type Args = {
  title: string;
  mediaSrc?: string | null;
  mediaFileUrl?: string | null;
  mediaExt?: 'pdf' | 'png' | 'webp' | 'jpg' | 'jpeg' | null;
  mediaMime?: string | null;
};

const isClient = typeof window !== 'undefined';

function withQuery(u: string, q: Record<string, string>): string {
  const url = new URL(u, isClient ? window.location.origin : 'http://localhost');
  Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, v));
  const rel = url.pathname + (url.search ? url.search : '');
  return u.startsWith('/') ? rel : url.toString();
}

function isSecureRoute(u: string): boolean {
  return u.startsWith('/api/products/storage');
}

function sanitizeFilename(title: string, ext: string): string {
  return `${title.replace(/\s+/g, '-').replace(/[^\w.-]/g, '')}.${ext}`;
}

export function useProductMediaActions(args: Args) {
  const { title, mediaSrc, mediaFileUrl, mediaExt, mediaMime } = args;

  const srcUrl = (mediaSrc ?? '').trim();
  const fbUrl = (mediaFileUrl ?? '').trim();

  const chosen = React.useMemo(() => {
    const srcKind = srcUrl
      ? detectMediaKind({ url: srcUrl, mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined })
      : 'unknown';

    const fbKind = fbUrl
      ? detectMediaKind({ url: fbUrl, mime: mediaMime ?? undefined, extHint: mediaExt ?? undefined })
      : 'unknown';

    const picked =
      (srcUrl && srcKind !== 'unknown' && { url: srcUrl, kind: srcKind }) ||
      (fbUrl && fbKind !== 'unknown' && { url: fbUrl, kind: fbKind }) || { url: '', kind: 'unknown' as const };

    return { picked, anyUrl: srcUrl || fbUrl };
  }, [srcUrl, fbUrl, mediaMime, mediaExt]);

  const base = chosen.picked.url || chosen.anyUrl;

  const downloadHref = React.useMemo(() => {
    if (!base) return '';
    const ext = mediaExt ?? 'pdf';
    const filename = sanitizeFilename(title, ext);
    return isSecureRoute(base) ? withQuery(base, { disposition: 'attachment', filename }) : base;
  }, [base, mediaExt, title]);

  const getPrintUrl = React.useCallback((): string | null => {
    if (!base) return null;
    return isSecureRoute(base) ? withQuery(base, { disposition: 'inline' }) : base;
  }, [base]);

  const handlePrint = React.useCallback(() => {
    if (!isClient) return;
    const printUrl = getPrintUrl();
    if (!printUrl) return;
    const win = window.open(printUrl, '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.addEventListener('load', () => {
      try { win.focus(); win.print(); } catch {}
    });
  }, [getPrintUrl]);

  return {
    showMediaActions: Boolean(base),
    downloadHref,
    handlePrint,
  };
}
