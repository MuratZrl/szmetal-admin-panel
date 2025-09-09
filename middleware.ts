// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// URL listelerini tek yerde topla
const ADMIN_ONLY = ['/dashboard', '/requests', '/clients', '/products', '/categories', '/admin'];
const PUBLIC_ROUTES = ['/login', '/register', '/reset-password', '/forget-password'];

// Cookie’leri redirect/rewrited response’a taşı
function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c);
  }
  return to;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;
  const pathname = url.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // obje formu daha sağlam
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: '', ...options, maxAge: -1 });
        },
      },
    }
  );

  // Oturum çek (cookie refresh de olabilir)
  const { data: { user } } = await supabase.auth.getUser();

  // Public route ise ve loginli kullanıcı geldiyse, yönlendir
  if (user && PUBLIC_ROUTES.includes(pathname)) {
    const r = NextResponse.redirect(new URL('/create_request', req.url));
    return withSupabaseCookies(res, r);
  }

  // Korunan sayfalar için: kullanıcı yoksa login'e
  if (!user) {
    // redirect sonrası geri dönmek için parametre
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname + url.search);
    const r = NextResponse.redirect(redirectUrl);
    return withSupabaseCookies(res, r);
  }

  // Role: önce metadata, yoksa DB fallback
  type Role = 'Admin' | 'User';
  let role = (user.app_metadata?.role ?? user.user_metadata?.role) as Role | undefined;

  if (!role) {
    const { data: row, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      const r = NextResponse.redirect(new URL('/unauthorized', req.url));
      return withSupabaseCookies(res, r);
    }
    role = row?.role as Role | undefined;
  }

  // Admin-only kısıtlama
  const isAdminRoute = ADMIN_ONLY.some(p => pathname.startsWith(p));
  if (isAdminRoute && role !== 'Admin') {
    const r = NextResponse.redirect(new URL('/unauthorized', req.url));
    return withSupabaseCookies(res, r);
  }

  return res;
}

// Sadece gerçekten korumak istediklerini eşle
export const config = {
  matcher: [
    '/account',
    '/dashboard',
    '/create_request/:path*',
    '/requests/:path*',
    '/clients',
    '/products/:path*',
    '/orders/:path*',
    '/categories/:path*',
    '/admin/:path*',

    // Public sayfaları BURAYA ekleme.
    // Route group (auth) klasörü URL’ye yansımaz, o yüzden '/auth/:path*' gereksiz.
  ],
};
