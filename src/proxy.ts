// src/proxy.ts  ← Next 16 için doğru yer
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieMethodsServer, type CookieOptions } from '@supabase/ssr';
import type { Database, Tables } from '@/types/supabase';

type Role = Tables<'users'>['role'];
type Status = Tables<'users'>['status'];
type UserRow = { role: Role; status: Status };

/* IP kısıtlama – sadece production'da aktif */
const ALLOWED_IPS: Set<string> = new Set(
  (process.env.ALLOWED_IPS ?? '').split(',').map(ip => ip.trim()).filter(Boolean),
);

function getClientIp(req: NextRequest): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null
  );
}
 
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;
const PUBLIC_ROUTES = ['/403', '/unauthorized'] as const;

const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: ['/account', '/clients', '/products_analytics', '/products'],
  User: ['/account', '/products'],
} as const;

const HOME_PATH = '/account' as const;

/* -------------------------------------------------------------------------- */

function normPath(p: string): string {
  if (!p || p === '/') return '/';
  const q = p.split('?')[0]!.split('#')[0]!;
  return q.endsWith('/') ? q.slice(0, -1) : q;
}

function isAuthRoute(path: string): boolean {
  const n = normPath(path);
  return AUTH_ROUTES.some((p) => n === p || n.startsWith(`${p}/`));
}

function isPublicRoute(path: string): boolean {
  const n = normPath(path);
  return PUBLIC_ROUTES.some((p) => n === p || n.startsWith(`${p}/`));
}

function isAllowedForRole(role: Role, path: string): boolean {
  const n = normPath(path);
  const allowed = ROLE_ACCESS[role];
  if (!allowed) return false;
  if (allowed.includes('*')) return true;
  return allowed.some((base) => n === base || n.startsWith(`${base}/`));
}

function hasSupabaseSessionCookies(req: NextRequest): boolean {
  const names = req.cookies.getAll().map(c => c.name);
  const hasLegacy = names.includes('sb-access-token') || names.includes('sb-refresh-token');
  const hasPacked = names.some(n => /^sb-[a-z0-9-]+-auth-token$/i.test(n));
  return hasLegacy || hasPacked;
}

function getSupabaseCookieNames(req: NextRequest): string[] {
  return req.cookies
    .getAll()
    .map(c => c.name)
    .filter(n =>
      n === 'sb-access-token' ||
      n === 'sb-refresh-token' ||
      /^sb-[a-z0-9-]+-auth-token$/i.test(n)
    );
}

/* Prefetch/HEAD/OPTIONS isteklerini ağır kontrolden çıkar. */
function isLightweight(req: NextRequest): boolean {
  const m = req.method.toUpperCase();
  if (m === 'HEAD' || m === 'OPTIONS') return true;
  const prefetch = req.headers.get('x-middleware-prefetch') === '1';
  const purpose = (req.headers.get('purpose') || '').toLowerCase() === 'prefetch';
  const nextFetch = (req.headers.get('next-router-prefetch') || '').toLowerCase() === '1';
  return prefetch || purpose || nextFetch;
}

/* Cache kontrolünü sadece yönlendirmelere uygula. */
function withNoStore(resp: NextResponse): NextResponse {
  resp.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return resp;
}

/* -------------------------------------------------------------------------- */

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const npath = normPath(req.nextUrl.pathname);

  // 0) Statik dosyaları ve açıkça hariç tuttuğumuz yolları geç
  if (
    npath.startsWith('/_next') ||
    npath.startsWith('/assets') ||
    npath === '/favicon.ico' ||
    npath === '/robots.txt' ||
    npath === '/sitemap.xml' ||
    /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i.test(npath)
  ) {
    return NextResponse.next();
  }

  // 0.25) IP kısıtlama – tüm rotalar için (production)
  if (process.env.NODE_ENV === 'production' && ALLOWED_IPS.size > 0) {
    const clientIp = getClientIp(req);
    if (!clientIp || !ALLOWED_IPS.has(clientIp)) {
      return new NextResponse('403 Forbidden', { status: 403 });
    }
  }

  // 0.5) Prefetch/HEAD/OPTIONS ise ağır iş yok; sadece temel yönlendirme kuralı uygula
  if (isLightweight(req)) {
    const hasSession = hasSupabaseSessionCookies(req);
    if (!hasSession && !isAuthRoute(npath) && !isPublicRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withNoStore(NextResponse.redirect(url));
    }
    return NextResponse.next();
  }

  // Yanıta sonradan cookie forward edebilmek için baz response
  const base = NextResponse.next();

  const written: Array<{ name: string; value: string; options: CookieOptions }> = [];
  
  const withForwardedCookies = (out: NextResponse): NextResponse => {
    for (const { name, value, options } of written) out.cookies.set(name, value, options);
    return out;
  };

  const writeCookie = (name: string, value: string, options: CookieOptions) => {
    written.push({ name, value, options });
    base.cookies.set(name, value, options);
  };

  // 1) Supabase çerezi yoksa SDK çağırma; korumalı rota ise login'e
  if (!hasSupabaseSessionCookies(req)) {
    if (!isAuthRoute(npath) && !isPublicRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withForwardedCookies(withNoStore(NextResponse.redirect(url)));
    }
    return withForwardedCookies(base);
  }

  // 2) Supabase client (cookie bridge)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !anon) {
    return withForwardedCookies(base);
  }

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => req.cookies.getAll(),
    setAll: (list) => {
      for (const c of list) {
        written.push(c);
        base.cookies.set(c.name, c.value, c.options);
      }
    },
  };

  const supabase = createServerClient<Database>(url, anon, {
    cookies: cookiesAdapter,
    auth: {
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  // 3) Oturumu oku
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    const u = req.nextUrl.clone();
    u.pathname = '/login';
    u.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return withForwardedCookies(withNoStore(NextResponse.redirect(u)));
  }

  // 4) Profil oku (role/status)
  type UserId = Tables<'users'>['id'];
  const profRes = await supabase
    .from('users')
    .select('role,status')
    .eq('id', user.id as UserId)
    .maybeSingle();

  const profile = (profRes.data ?? null) as UserRow | null;
  if (!profile) {
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    return withForwardedCookies(withNoStore(NextResponse.redirect(new URL('/login?error=profile-missing', req.url))));
  }

  // 5) Status kuralları
  if (profile.status === 'Banned') {
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    return withForwardedCookies(withNoStore(NextResponse.redirect(new URL('/login?reason=banned', req.url))));
  }

  if (profile.status === 'Inactive') {
    const isAccount = npath === '/account' || npath.startsWith('/account/');
    if (!isAccount) {
      return withForwardedCookies(withNoStore(NextResponse.redirect(new URL('/account?reason=inactive', req.url))));
    }
  }

  // 6) Login iken auth sayfalarına gitme → /account
  //    (reset-password hariç — OTP exchange sonrası session var ama şifre henüz güncellenmedi)
  if (isAuthRoute(npath) && npath !== '/reset-password') {
    return withForwardedCookies(withNoStore(NextResponse.redirect(new URL(HOME_PATH, req.url))));
  }

  // 7) Root → /account
  if (npath === '/') {
    return withForwardedCookies(withNoStore(NextResponse.redirect(new URL(HOME_PATH, req.url))));
  }

  // 8) Rol yetkisi
  if (!isAllowedForRole(profile.role, npath)) {
    return withForwardedCookies(withNoStore(NextResponse.redirect(new URL('/unauthorized?reason=role', req.url))));
  }

  // 9) Yol temiz
  return withForwardedCookies(NextResponse.next());
}

// Bu matcher artık proxy.ts içinde olmalı
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
