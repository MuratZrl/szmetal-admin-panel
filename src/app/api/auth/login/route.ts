// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { SerializeOptions } from 'cookie';

type Body = { email: string; password: string };

function normalizeCookieOptions(
  o?: Partial<SerializeOptions>
): {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
} {
  if (!o) return {};
  let sameSite: 'strict' | 'lax' | 'none' | undefined;
  if (typeof o.sameSite === 'boolean') {
    sameSite = o.sameSite ? 'strict' : undefined; // false ise hiç yazma
  } else {
    sameSite = o.sameSite; // 'lax' | 'strict' | 'none' | undefined
  }
  return {
    domain: o.domain,
    expires: o.expires as Date | undefined,
    httpOnly: o.httpOnly,
    maxAge: typeof o.maxAge === 'number' ? o.maxAge : undefined,
    path: o.path,
    sameSite,
    secure: o.secure,
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!; // SADECE server env

  // 1) Ban kontrolü (service role ile RLS bypass)
  const admin = createAdminClient(url, service, { auth: { persistSession: false } });

  // public.users tablosunda email sütunu varsa buradan kontrol et
  const { data: row } = await admin
    .from('users')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (row?.status === 'Banned') {
    return NextResponse.json({ error: 'banned' }, { status: 403 });
  }

  // 2) Supabase SSR client — request cookies'ten oku, response'a yazılacakları topla
  const cookieStore = await cookies(); // Next 15'te Promise olabilir, o yüzden await
  const pending: { name: string; value: string; options?: Partial<SerializeOptions> }[] = [];

  const supabase = createServerClient(url, anon, {
    cookies: {
      // Route handler V2 imzası: getAll / setAll
      getAll() {
        return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
      },
      setAll(toSet) {
        // Şimdi yazmıyoruz, response’a uygulayacağız
        toSet.forEach(({ name, value, options }) => {
          pending.push({ name, value, options });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: body.password,
  });

  if (error || !data.user) {
    const msg = (error?.message ?? '').toLowerCase();
    if (msg.includes('email not confirmed')) {
      return NextResponse.json({ error: 'email_not_confirmed' }, { status: 409 });
    }
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  // 3) Yarış durumuna karşı: girişten sonra da ban kontrolü
  const { data: me } = await supabase
    .from('users')
    .select('status')
    .eq('id', data.user.id)
    .single();

  if (me?.status === 'Banned') {
    await supabase.auth.signOut();
    const r403 = NextResponse.json({ error: 'banned' }, { status: 403 });
    pending.forEach(pc => r403.cookies.set({ name: pc.name, value: pc.value, ...(pc.options ?? {}) }));
    return r403;
  }

  // 4) Başarılı: pending cookie'leri response’a uygula
  const r200 = NextResponse.json({ ok: true });
  for (const pc of pending) {
    r200.cookies.set({ name: pc.name, value: pc.value, ...normalizeCookieOptions(pc.options) });
  }
  return r200;
}