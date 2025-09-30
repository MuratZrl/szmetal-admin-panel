// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieMethodsServer, type CookieOptions } from '@supabase/ssr';
import type { Database, Tables } from '@/types/supabase';

type Role = Tables<'users'>['role'];
type Status = Tables<'users'>['status'];
type UserRow = { role: Role; status: Status };

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

const ROLE_ACCESS: Record<Role, readonly string[]> = {
  Admin: ['*'],
  Manager: ['/create_request', '/requests', '/clients', '/orders', '/products', '/account'],
  User: ['/account', '/create_request', '/orders'],
} as const;

function normPath(p: string): string {
  if (!p || p === '/') return '/';
  const q = p.split('?')[0]!.split('#')[0]!;
  return q.endsWith('/') ? q.slice(0, -1) : q;
}
function isAuthRoute(path: string): boolean {
  const n = normPath(path);
  return AUTH_ROUTES.some(p => n.startsWith(p));
}
function isAllowedForRole(role: Role, path: string): boolean {
  const n = normPath(path);
  const allowed = ROLE_ACCESS[role];
  if (allowed.includes('*')) return true;
  return allowed.some(base => n === base || n.startsWith(`${base}/`));
}
function roleHome(role: Role): string {
  switch (role) {
    case 'Admin': return '/dashboard';
    case 'Manager': return '/account';
    case 'User': return '/account';
    default: return '/account';
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const npath = normPath(req.nextUrl.pathname);

  // 0) Statik istekleri atla
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

  // 1) Prefetch ise ağır iş yok
  const isPrefetch =
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch';

  // Tüm case’lerde kullanacağımız “base” response
  const base = NextResponse.next({ request: req });
  base.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  if (isPrefetch) {
    // Prefetch'e token tazeleme, DB sorgusu, redirect falan yapma
    return base;
  }

  // 2) Supabase client + cookie adapter
  //    setAll çağrıları hem base.cookies.set yapsın hem de ileride forward edebilmek için kayda geçsin
  const written: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const cookiesAdapter: CookieMethodsServer = {
    getAll: () => req.cookies.getAll(),
    setAll: list => {
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

  // Küçük yardımcı: redirect döndürmeden önce çerezleri forward et
  const withForwardedCookies = (out: NextResponse): NextResponse => {
    out.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    for (const { name, value, options } of written) {
      out.cookies.set(name, value, options); // options KAYBOLMADAN
    }
    return out;
  };

  // 3) Oturum var mı? (middleware token refresh’in ana gerekçesi)
  const { data: { user } } = await supabase.auth.getUser();

  // 3.a) Kullanıcı yok
  if (!user) {
    // Auth sayfaları serbest, diğer her şey login
    if (!isAuthRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withForwardedCookies(NextResponse.redirect(url));
    }
    return base;
  }

  // 3.b) Profil ve durum
  type UserId = Tables<'users'>['id'];
  const profRes = await supabase
    .from('users')
    .select('role,status')
    .eq('id', user.id as UserId)
    .maybeSingle();

  const profile = (profRes.data ?? null) as UserRow | null;

  if (!profile) {
    // tokenları temizle
    base.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 });
    base.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 });
    return withForwardedCookies(
      NextResponse.redirect(new URL('/login?error=profile-missing', req.url))
    );
  }

  // 4) Status kuralları
  if (profile.status === 'Banned') {
    base.cookies.set('sb-access-token', '', { path: '/', maxAge: 0 });
    base.cookies.set('sb-refresh-token', '', { path: '/', maxAge: 0 });
    return withForwardedCookies(
      NextResponse.redirect(new URL('/unauthorized', req.url))
    );
  }

  if (profile.status === 'Inactive' && (npath === '/create_request' || npath.startsWith('/create_request/'))) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/403', req.url))
    );
  }

  // 5) Login/register gibi auth sayfalarına girişliyken girme
  if (isAuthRoute(npath)) {
    return withForwardedCookies(
      NextResponse.redirect(new URL(roleHome(profile.role), req.url))
    );
  }

  // 6) Rol bazlı yetki
  if (!isAllowedForRole(profile.role, npath)) {
    return withForwardedCookies(
      NextResponse.redirect(new URL('/403', req.url))
    );
  }

  // 7) Yol temiz
  return base;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
