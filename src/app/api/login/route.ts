// src/app/api/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Status = 'Active' | 'Inactive' | 'Banned';
type Role = 'Admin' | 'Manager' | 'User';
type ProfileRow = { status: Status; role: Role };

type LoginErrorKey =
  | 'invalid_json'
  | 'email_or_password_missing'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'profile_missing'
  | 'banned'
  | 'inactive'
  | 'server_error'
  | 'method_not_allowed';

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_ATTEMPTS = 10;

declare global {
  // Dev HMR sırasında aynı Map’i korumak için global referans
  var __RL__: Map<string, number[]> | undefined;
}

const rlStore: Map<string, number[]> = (globalThis.__RL__ ??= new Map<string, number[]>());

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const xr = req.headers.get('x-real-ip')?.trim();
  return xf || xr || '0.0.0.0';
}

function rateLimitHit(ip: string): boolean {
  const now = Date.now();
  const arr = rlStore.get(ip) ?? [];
  const fresh = arr.filter(t => now - t < RATE_WINDOW_MS);
  fresh.push(now);
  rlStore.set(ip, fresh);
  return fresh.length > RATE_MAX_ATTEMPTS;
}

function json<T>(body: T, init?: number | ResponseInit) {
  const resInit: ResponseInit | undefined = typeof init === 'number' ? { status: init } : init;
  const res = NextResponse.json(body, resInit);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

type Body = { email?: string; password?: string };

function validateBody(b: unknown): { email: string; password: string } | null {
  if (!b || typeof b !== 'object') return null;
  const { email, password } = b as Body;
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const pw = typeof password === 'string' ? password : '';
  if (!em || !pw) return null;
  return { email: em, password: pw };
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimitHit(ip)) {
    const retryAfter = Math.ceil(RATE_WINDOW_MS / 1000).toString();
    return json<{ error: LoginErrorKey }>(
      { error: 'invalid_credentials' },
      { status: 429, headers: { 'Retry-After': retryAfter } }
    );
  }

  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return json<{ error: LoginErrorKey }>({ error: 'invalid_json' }, 400);
  }

  const dto = validateBody(parsed);
  if (!dto) {
    return json<{ error: LoginErrorKey }>({ error: 'email_or_password_missing' }, 400);
  }

  const supabase = await createSupabaseRouteClient();

  // Sessiyon varsa önce sessizce kapat. Supabase bazen "refresh_token_not_found" fırlatıyor.
  try {
    await supabase.auth.signOut();
    
  } catch {
    // Boşver, amaç logları temiz tutmak
  }

  const { data, error } = await supabase.auth.signInWithPassword(dto);

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      return json<{ error: LoginErrorKey }>({ error: 'email_not_confirmed' }, 409);
    }
    return json<{ error: LoginErrorKey }>({ error: 'invalid_credentials' }, 401);
  }

  const user = data.user;
  if (!user) {
    // Teoride olmaz ama olur da olursa, temizlik yap.
    try { await supabase.auth.signOut(); } catch {}
    return json<{ error: LoginErrorKey }>({ error: 'server_error' }, 500);
  }

  if (!user.email_confirmed_at) {
    try { await supabase.auth.signOut(); } catch {}
    return json<{ error: LoginErrorKey }>({ error: 'email_not_confirmed' }, 409);
  }

  const { data: profile, error: profErr } = await supabase
    .from('users')
    .select('status, role')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (profErr || !profile) {
    try { await supabase.auth.signOut(); } catch {}
    return json<{ error: LoginErrorKey }>({ error: 'profile_missing' }, 403);
  }

  if (profile.status === 'Banned') {
    try { await supabase.auth.signOut(); } catch {}
    return json<{ error: LoginErrorKey }>({ error: 'banned' }, 403);
  }

  if (profile.status === 'Inactive') {
    try { await supabase.auth.signOut(); } catch {}
    return json<{ error: LoginErrorKey }>({ error: 'inactive' }, 403);
  }

  // Başarılı
  return json<{ ok: true; role: Role }>({ ok: true, role: profile.role }, 200);
}

// Güvenli olsun: POST dışında method yok.
export async function GET() {
  return json<{ error: LoginErrorKey }>({ error: 'method_not_allowed' }, { status: 405, headers: { Allow: 'POST' } });
}

export async function PUT()  { return GET(); }
export async function PATCH(){ return GET(); }
export async function DELETE(){return GET(); }
export async function OPTIONS(){ return GET(); }
