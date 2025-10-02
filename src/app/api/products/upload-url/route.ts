// app/api/products/upload-url/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type Body = {
  /** Klasör/prefix: örn "65800a9c-...-b297c7" (ürün id) */
  dir: string;
  /** Orijinal dosya adı ya da uzantı ipucu için ext, ikisinden biri yeter. */
  originalName?: string;
  extHint?: string | null;
};

const ALLOWED_EXT = new Set(['pdf','png','webp','jpg','jpeg']);

function pickExt(originalName?: string, extHint?: string | null): string {
  const fromName = (originalName ?? '').split('.').pop()?.toLowerCase() ?? '';
  const candidate = (extHint ?? fromName).toLowerCase();
  return ALLOWED_EXT.has(candidate) ? candidate : 'bin';
}

function randomId(len = 10): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  const userId = auth?.user?.id ?? null;
  if (!userId) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

  // Rol kontrolü
  type DbRole = Database['public']['Tables']['users']['Row']['role'];
  const { data: me } = await sb
    .from('users')
    .select('role')
    .eq('id', userId)
    .returns<{ role: DbRole }[]>()
    .maybeSingle();

  if (me?.role !== 'Admin') {
    return NextResponse.json({ error: 'Yetki yok' }, { status: 403 });
  }

  // İstek gövdesi
  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const dirRaw = (body.dir ?? '').trim().replace(/^\/+|\/+$/g, '');
  if (!dirRaw) return NextResponse.json({ error: 'dir zorunlu' }, { status: 400 });

  const ext = pickExt(body.originalName, body.extHint);
  const fileName = `${Date.now()}-${randomId()}.${ext}`;
  const objectPath = `${dirRaw}/${fileName}`;

  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Kısa ömürlü imzalı upload URL (60 sn yeterli)
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(objectPath);
  if (error || !data) {
    return NextResponse.json({ error: 'Upload URL üretilemedi' }, { status: 500 });
  }

  return NextResponse.json({
    bucket: BUCKET,
    path: objectPath,        // DB’ye kaydedeceğin değer (bucket’sız path)
    token: data.token,       // uploadToSignedUrl için lazım
    signedUrl: data.signedUrl,
  });
}
