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

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

// Belli sayfaları her koşulda erişilebilir bırak (loop kırmak ve bilerek public yapmak için)
const PUBLIC_ROUTES = ['/', '/403', '/unauthorized'] as const;

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
  return AUTH_ROUTES.some((p) => n === p || n.startsWith(`${p}/`));
}

function isPublicRoute(path: string): boolean {
  const n = normPath(path);
  return PUBLIC_ROUTES.some((p) => n === p || n.startsWith(`${p}/`));
}

function isAllowedForRole(role: Role, path: string): boolean {
  const n = normPath(path);
  const allowed = ROLE_ACCESS[role];
  if (allowed.includes('*')) return true;
  return allowed.some((base) => n === base || n.startsWith(`${base}/`));
}

function roleHome(role: Role): string {
  switch (role) {
    case 'Admin':
      return '/dashboard';
    case 'Manager':
    case 'User':
    default:
      return '/account';
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const npath = normPath(req.nextUrl.pathname);

  // 0) Statik istekleri atla (matcher zaten filtreliyor ama hız için burada da dursun)
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

  const base = NextResponse.next({ request: req });
  base.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  if (isPrefetch) return base;

  // 2) Supabase client + cookie forward altyapısı
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

  // Her türlü çıkışta supabase’in yazdığı cookie’leri yeni response’a forward et
  const withForwardedCookies = (out: NextResponse): NextResponse => {
    out.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    for (const { name, value, options } of written) {
      out.cookies.set(name, value, options);
    }
    return out;
  };

  // Base’e yazacağın her manual cookie’yi aynı zamanda "written" listesine ekle ki redirect’e taşınsın
  const writeCookie = (name: string, value: string, options: CookieOptions) => {
    written.push({ name, value, options });
    base.cookies.set(name, value, options);
  };

  // 3) Oturum kontrolü (token refresh burada)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3.a) Kullanıcı yok
  if (!user) {
    // Public veya auth sayfaları serbest, gerisi login
    if (!isAuthRoute(npath) && !isPublicRoute(npath)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return withForwardedCookies(NextResponse.redirect(url));
    }
    return withForwardedCookies(base);
  }

  // 3.b) Profil + durum
  type UserId = Tables<'users'>['id'];
  const profRes = await supabase
    .from('users')
    .select('role,status')
    .eq('id', user.id as UserId)
    .maybeSingle();

  const profile = (profRes.data ?? null) as UserRow | null;

  if (!profile) {
    // tokenları temizle (ve yönlendirmede gerçekten gitsinler)
    writeCookie('sb-access-token', '', { path: '/', maxAge: 0 });
    writeCookie('sb-refresh-token', '', { path: '/', maxAge: 0 });

    const url = new URL('/login?error=profile-missing', req.url);
    return withForwardedCookies(NextResponse.redirect(url));
  }

  // 4) Status kuralları
  if (profile.status === 'Banned') {
    writeCookie('sb-access-token', '', { path: '/', maxAge: 0 });
    writeCookie('sb-refresh-token', '', { path: '/', maxAge: 0 });

    // /unauthorized public sayfa; login’e çarpıp geri dönmesin
    return withForwardedCookies(NextResponse.redirect(new URL('/unauthorized', req.url)));
  }

  if (
    profile.status === 'Inactive' &&
    (npath === '/create_request' || npath.startsWith('/create_request/'))
  ) {
    return withForwardedCookies(NextResponse.redirect(new URL('/403', req.url)));
  }

  // 5) Girişliyken auth sayfalarına gitme
  if (isAuthRoute(npath)) {
    return withForwardedCookies(NextResponse.redirect(new URL(roleHome(profile.role), req.url)));
  }

  // 6) Root’u role home’a yönlendir (isteğe bağlı ama genelde mantıklı)
  if (npath === '/') {
    return withForwardedCookies(NextResponse.redirect(new URL(roleHome(profile.role), req.url)));
  }

  // 7) Rol bazlı yetki
  if (!isAllowedForRole(profile.role, npath)) {
    return withForwardedCookies(NextResponse.redirect(new URL('/403', req.url)));
  }

  // 8) Yol temiz
  return withForwardedCookies(base);
}

// API route’ları middleware dışı bırakmak genelde daha sağlıklıdır.
// Eğer API’yi de korumak istiyorsan bu dışlamayı kaldır ve orada ayrı kontrol yap.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)',
  ],
};
