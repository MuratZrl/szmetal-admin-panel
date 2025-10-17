// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from '@supabase/ssr';
import type { Database, Tables } from '@/types/supabase';

type Role = Tables<'users'>['role'];
type Status = Tables<'users'>['status'];
type UserRow = { role: Role; status: Status };

const AUTH_ROUTES = ['/login', '/register', '/forget-password', '/reset-password'] as const;
const PUBLIC_ROUTES = ['/', '/403', '/unauthorized'] as const;

/** Rol erişimleri (son halinle aynı bıraktım) */
const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: ['/account', '/requests', '/clients', '/orders', '/create_request', '/products'],
  User: ['/account', '/create_request', '/orders', '/products'],
} as const;

/** Herkes için ortak ana sayfa */
const HOME_PATH = '/account' as const;

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                */
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

/** Tarayıcıda Supabase oturum çerezi var mı? Varsa SDK’ya sormaya değer. */
function hasSupabaseSessionCookies(req: NextRequest): boolean {
  const names = req.cookies.getAll().map(c => c.name);
  const hasLegacy = names.includes('sb-access-token') || names.includes('sb-refresh-token');
  const hasPacked = names.some(n => /^sb-[a-z0-9-]+-auth-token$/i.test(n));
  return hasLegacy || hasPacked;
}

/** Mevcut istekte görünen tüm Supabase auth cookie adları */
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

/* -------------------------------------------------------------------------- */
/* Middleware                                                                 */
/* -------------------------------------------------------------------------- */

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const npath = normPath(req.nextUrl.pathname);

  // 0) Statik istekleri geç
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

  // Baz yanıt (cookie forward için)
  const base = NextResponse.next();
  base.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const written: Array<{ name: string; value: string; options: CookieOptions }> = [];
  const withForwardedCookies = (out: NextResponse): NextResponse => {
    out.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    for (const { name, value, options } of written) out.cookies.set(name, value, options);
    return out;
  };
  const writeCookie = (name: string, value: string, options: CookieOptions) => {
    written.push({ name, value, options });
    base.cookies.set(name, value, options);
  };

  /* 1) ERKEN ÇIKIŞ: Supabase oturum çerezi yoksa SDK’ya hiç sorma.
        Böylece "Invalid Refresh Token: Refresh Token Not Found" logu gelmez. */
  const hasSessionCookie = hasSupabaseSessionCookies(req);
  if (!hasSessionCookie) {
    // Korumalı rota mı? Auth/public değilse login’e yolla.
    if (!isAuthRoute(npath) && !isPublicRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withForwardedCookies(NextResponse.redirect(url));
    }
    // Auth veya public ise sessiz geç
    return withForwardedCookies(base);
  }

  // 2) Supabase client (cookie bridge ile)
  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => req.cookies.getAll(),
    setAll: (list) => {
      for (const c of list) {
        written.push(c);
        base.cookies.set(c.name, c.value, c.options);
      }
    },
  };
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { cookies: cookiesAdapter }
  );

  // 3) Oturumu oku
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Çerez var ama geçerli user yok: tüm Supabase auth çerezlerini temizle, login’e
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return withForwardedCookies(NextResponse.redirect(url));
  }

  // 4) Profil
  type UserId = Tables<'users'>['id'];
  const profRes = await supabase
    .from('users')
    .select('role,status')
    .eq('id', user.id as UserId)
    .maybeSingle();

  const profile = (profRes.data ?? null) as UserRow | null;
  if (!profile) {
    // Profil yoksa tüm Supabase auth cookie’lerini temizleyip login’e
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    const url = new URL('/login?error=profile-missing', req.url);
    return withForwardedCookies(NextResponse.redirect(url));
  }

  // 5) Status kuralları
  if (profile.status === 'Banned') {
    for (const name of getSupabaseCookieNames(req)) {
      writeCookie(name, '', { path: '/', maxAge: 0 });
    }
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=banned', req.url))
    );
  }
  if (profile.status === 'Inactive' && (npath === '/create_request' || npath.startsWith('/create_request/'))) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=inactive', req.url))
    );
  }

  // 6) Login iken auth sayfalarına gitme → HERKES /account
  if (isAuthRoute(npath)) {
    return withForwardedCookies(NextResponse.redirect(new URL(HOME_PATH, req.url)));
  }

  // 7) Root → HERKES /account
  if (npath === '/') {
    return withForwardedCookies(NextResponse.redirect(new URL(HOME_PATH, req.url)));
  }

  // 8) Rol yetkisi
  if (!isAllowedForRole(profile.role, npath)) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=role', req.url))
    );
  }

  // 9) Yol temiz
  return withForwardedCookies(base);
}

/* -------------------------------------------------------------------------- */

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
