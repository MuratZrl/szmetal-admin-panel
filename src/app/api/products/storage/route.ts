// app/api/products/storage/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

type Disposition = 'inline' | 'attachment';

function extFromPath(path: string): string {
  const clean = path.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function guessContentTypeByExtFromPath(path: string): string {
  const ext = extFromPath(path);
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'txt') return 'text/plain; charset=utf-8';
  if (ext === 'csv') return 'text/csv; charset=utf-8';
  if (ext === 'json') return 'application/json';
  if (ext === 'zip') return 'application/zip';
  return 'application/octet-stream';
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '').trim();
  return (cleaned || 'file').slice(0, 180);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new globalThis.URL(req.url);

  const bucket = (searchParams.get('bucket') ?? '').trim();
  const path = (searchParams.get('path') ?? '').trim();
  const dispositionRaw = (searchParams.get('disposition') ?? 'attachment').trim().toLowerCase();
  const disposition: Disposition = dispositionRaw === 'inline' ? 'inline' : 'attachment';
  const filenameParam = (searchParams.get('filename') ?? '').trim();
  const fallbackName = path.split('/').pop() ?? 'file.bin';
  const filename = sanitizeFilename(filenameParam || fallbackName);

  if (!bucket || !path) {
    return NextResponse.json({ error: 'bucket ve path zorunludur.' }, { status: 400 });
  }

  // 1) Oturum (çerezleri request’ten oku, yoksa 401 gel-git yaşarsın)
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set() { /* no-op */ },
        remove() { /* no-op */ },
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
  }

  // 2) Rol kontrolü (yalnızca Admin + Manager)
  type DbRole = Database['public']['Tables']['users']['Row']['role'];
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
    .returns<{ role: DbRole } | null>();
  if (meErr) {
    return NextResponse.json({ error: 'Rol okunamadı.' }, { status: 500 });
  }
  const role = me?.role ?? null;
  if (!role || (role !== 'Admin' && role !== 'Manager')) {
    return NextResponse.json({ error: 'Yetki yok.' }, { status: 403 });
  }

  // 3) Storage’dan indir (Service Role ile)
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik.' }, { status: 500 });
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: blob, error: dlErr } = await admin.storage.from(bucket).download(path);
  if (dlErr || !blob) {
    return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 404 });
  }

  // Content-Type: blob’dan ya da path uzantısından
  const typeFromBlob = (blob as unknown as { type?: string })?.type || '';
  const contentType = typeFromBlob || guessContentTypeByExtFromPath(path);

  const buf = Buffer.from(await blob.arrayBuffer());

  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Disposition':
      `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'Cache-Control': 'private, max-age=60, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': `frame-ancestors 'self'`,
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
  });

  return new NextResponse(buf, { status: 200, headers });
}
