// app/api/auth/login/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  if (typeof o.sameSite === 'boolean') sameSite = o.sameSite ? 'strict' : undefined;
  else sameSite = o.sameSite;
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
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 0) Env doğrula
    const missing = ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']
      .filter(k => !process.env[k]);
    if (missing.length > 0) {
      console.error('ENV MISSING', missing);
      return NextResponse.json({ error: 'env_missing', missing }, { status: 500 });
    }

    // 1) Pre-ban kontrol (service role ile)
    const admin = createAdminClient(url!, service!, { auth: { persistSession: false } });
    const { data: preb, error: prebErr } = await admin
      .from('users')
      .select('id, role, status')
      .eq('email', email)
      .maybeSingle();

    if (prebErr) {
      // Prod’da RLS/conn hatası burada belli olur
      console.error('admin precheck error:', prebErr);
    }
    const preBanned =
      (preb?.role && preb.role.toLowerCase() === 'banned') ||
      (preb?.status && preb.status.toLowerCase() === 'banned');

    if (preBanned) {
      return NextResponse.json({ error: 'banned' }, { status: 403 });
    }

    // 2) SSR Supabase + cookie toplama
    const cookieStore = await cookies();
    const pending: { name: string; value: string; options?: Partial<SerializeOptions> }[] = [];

    const supabase = createServerClient(url!, anon!, {
      cookies: {
        getAll() { return cookieStore.getAll().map(c => ({ name: c.name, value: c.value })); },
        setAll(toSet) { toSet.forEach(({ name, value, options }) => pending.push({ name, value, options })); },
      },
    });

    // 3) Sign-in
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

    // 4) Post-ban kontrol (yarış durumları için)
    const { data: me, error: meErr } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle();

    if (meErr) console.error('self row fetch error:', meErr);

    const postBanned =
      (me?.role && me.role.toLowerCase() === 'banned') ||
      (me?.status && me.status.toLowerCase() === 'banned');

    if (postBanned) {
      await supabase.auth.signOut();
      const r403 = NextResponse.json({ error: 'banned' }, { status: 403 });
      pending.forEach(pc => r403.cookies.set({ name: pc.name, value: pc.value, ...normalizeCookieOptions(pc.options) }));
      return r403;
    }

    // 5) Başarılı
    const r200 = NextResponse.json({ ok: true });
    pending.forEach(pc => r200.cookies.set({ name: pc.name, value: pc.value, ...normalizeCookieOptions(pc.options) }));
    return r200;
  } catch (e) {
    console.error('login fatal:', e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
