// app/api/products/storage/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

type Disposition = 'inline' | 'attachment';

function getSupabaseAdmin(): ReturnType<typeof createClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function guessMimeFromPath(p: string): string {
  const ext = (p.split('?')[0].split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '').trim();
  return (cleaned || 'file').slice(0, 180);
}

function isExternalUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !ANON || !SERVICE) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik.' }, { status: 500 });
  }

  // ✅ Next 16: params Promise geliyor, önce unwrap et
  const { id } = await params;

  if (!id || id === 'undefined' || !isUuid(id)) {
    return NextResponse.json({ error: 'Geçersiz ürün id.' }, { status: 400 });
  }

  // 1) Auth: cookie -> user
  const supabase = createServerClient<Database>(SUPABASE_URL, ANON, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set() {},
      remove() {},
    },
  });

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) return NextResponse.json({ error: 'Auth hatası' }, { status: 401 });

  const userId = authData?.user?.id ?? null;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2) Admin client ile kullanıcı status kontrol (RLS bypass)
  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Admin client init failed';
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik.', detail: msg }, { status: 500 });
  }

  const { data: me, error: meErr } = await admin
    .from('users')
    .select('status, role')
    .eq('id', userId)
    .maybeSingle();

  if (meErr) {
    return NextResponse.json(
      { error: 'Kullanıcı okunamadı', detail: process.env.NODE_ENV !== 'production' ? meErr.message : undefined },
      { status: 500 }
    );
  }

  if (me?.status === 'Banned') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3) Ürünü admin ile çek
  const { data: row, error: rowErr } = await admin
    .from('products')
    .select('id, file_bucket, file_path, file_ext, file_mime, image')
    .eq('id', id)
    .maybeSingle();

  if (rowErr) {
    return NextResponse.json(
      { error: 'Ürün okunamadı', detail: process.env.NODE_ENV !== 'production' ? rowErr.message : undefined },
      { status: 500 }
    );
  }
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = new URL(req.url);
  const slot = (url.searchParams.get('slot') ?? 'primary').toLowerCase();
  const dispositionRaw = (url.searchParams.get('disposition') ?? 'inline').toLowerCase();
  const disposition: Disposition = dispositionRaw === 'attachment' ? 'attachment' : 'inline';
  const filenameParam = (url.searchParams.get('filename') ?? '').trim();

  const preferPdf = (row.file_ext ?? '').toLowerCase() === 'pdf' && !!row.file_path;

  const rawPrimary = preferPdf ? row.file_path : row.image;
  const rawSecondary = preferPdf ? row.image : row.file_path;
  const picked = slot === 'secondary' ? rawSecondary : rawPrimary;

  if (!picked) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (isExternalUrl(picked)) return NextResponse.json({ error: 'Invalid media source' }, { status: 400 });

  const bucket = row.file_bucket ?? (process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media');

  // 4) Storage download
  const { data: blob, error: dlErr } = await admin.storage.from(bucket).download(picked);
  if (dlErr || !blob) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });

  const fallbackName = picked.split('/').pop() ?? 'file.bin';
  const filename = sanitizeFilename(filenameParam || fallbackName);

  const guessed = guessMimeFromPath(picked);
  const typeFromBlob = ((blob as unknown as { type?: string }).type ?? '').trim();
  const contentType =
    guessed !== 'application/octet-stream' ? guessed : (row.file_mime ?? (typeFromBlob || guessed));

  const buf = Buffer.from(await blob.arrayBuffer());

  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Length': String(buf.length),
    'Content-Disposition': `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': `frame-ancestors 'self'`,
  });

  return new NextResponse(buf, { status: 200, headers });
}
