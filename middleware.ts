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

/** Rol erişimleri: spes’e göre User sadece 3 sayfa görecek. */
const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: ['/account', '/requests', '/clients', '/orders', '/create_request', '/products'],
  User: ['/account', '/create_request', '/orders', '/products'],
} as const;

/** Herkes için ortak ana sayfa */
const HOME_PATH = '/account' as const;

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

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const npath = normPath(req.nextUrl.pathname);

  // Statik istekleri geç
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

  // Supabase cookie köprüsü (Edge uyumlu)
  const written: Array<{ name: string; value: string; options: CookieOptions }> = [];
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

  const withForwardedCookies = (out: NextResponse): NextResponse => {
    out.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    for (const { name, value, options } of written) out.cookies.set(name, value, options);
    return out;
  };
  const writeCookie = (name: string, value: string, options: CookieOptions) => {
    written.push({ name, value, options });
    base.cookies.set(name, value, options);
  };

  // 1) Oturum
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!isAuthRoute(npath) && !isPublicRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withForwardedCookies(NextResponse.redirect(url));
    }
    return withForwardedCookies(base);
  }

  // 2) Profil
  type UserId = Tables<'users'>['id'];
  const profRes = await supabase
    .from('users')
    .select('role,status')
    .eq('id', user.id as UserId)
    .maybeSingle();

  const profile = (profRes.data ?? null) as UserRow | null;
  if (!profile) {
    // Profil yoksa sessiyonu sil ve login’e gönder
    writeCookie('sb-access-token', '', { path: '/', maxAge: 0 });
    writeCookie('sb-refresh-token', '', { path: '/', maxAge: 0 });
    const url = new URL('/login?error=profile-missing', req.url);
    return withForwardedCookies(NextResponse.redirect(url));
  }

  // 3) Status kuralları
  if (profile.status === 'Banned') {
    writeCookie('sb-access-token', '', { path: '/', maxAge: 0 });
    writeCookie('sb-refresh-token', '', { path: '/', maxAge: 0 });
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=banned', req.url))
    );
  }
  if (profile.status === 'Inactive' && (npath === '/create_request' || npath.startsWith('/create_request/'))) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=inactive', req.url))
    );
  }

  // 4) Login iken auth sayfalarına gitme → HERKES /account
  if (isAuthRoute(npath)) {
    return withForwardedCookies(NextResponse.redirect(new URL(HOME_PATH, req.url)));
  }

  // 5) Root → HERKES /account
  if (npath === '/') {
    return withForwardedCookies(NextResponse.redirect(new URL(HOME_PATH, req.url)));
  }

  // 6) Rol yetkisi
  if (!isAllowedForRole(profile.role, npath)) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized?reason=role', req.url))
    );
  }

  // 7) Yol temiz
  return withForwardedCookies(base);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
