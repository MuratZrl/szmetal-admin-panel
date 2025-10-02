// app/api/products/signed-upload/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type Body = {
  filename: string; // orijinal dosya adı
  dir: string;      // bucket içindeki klasör (örn: ürün id → "6580....b297c7")
};

const ALLOWED = new Set(['pdf', 'png', 'webp', 'jpg', 'jpeg']);

function safeExt(name: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return ALLOWED.has(ext) ? ext : 'bin';
}

function rand(n = 10): string {
  const s = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < n; i++) out += s[Math.floor(Math.random() * s.length)];
  return out;
}

export async function POST(req: NextRequest) {
  // 1) Oturum + rol kontrol
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  const uid = auth?.user?.id ?? null;
  if (!uid) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 });

  type DbRole = Database['public']['Tables']['users']['Row']['role'];
  const { data: me } = await sb
    .from('users')
    .select('role')
    .eq('id', uid)
    .returns<{ role: DbRole }[]>()
    .maybeSingle();

  if (me?.role !== 'Admin') {
    return NextResponse.json({ error: 'Yetki yok' }, { status: 403 });
  }

  // 2) Body al
  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const filename = (body.filename || '').trim();
  const dirRaw = (body.dir || '').trim().replace(/^\/+|\/+$/g, '');
  if (!filename || !dirRaw) {
    return NextResponse.json({ error: 'filename ve dir zorunlu' }, { status: 400 });
  }

  // 3) SRV ile signed upload URL üret
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET ?? 'product-media';

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 });
  }

  const ext = safeExt(filename);
  const objectPath = `${dirRaw}/${Date.now()}-${rand()}.${ext}`;

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(objectPath); // 60 sn

  if (error || !data) {
    return NextResponse.json({ error: 'Upload URL üretilemedi' }, { status: 500 });
  }

  return NextResponse.json({
    bucket: BUCKET,
    path: objectPath,  // DB'ye kaydedeceğin path
    token: data.token, // uploadToSignedUrl için
  });
}
