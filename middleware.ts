// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { isAdminOnly } from '@/lib/supabase/auth/routeGuards';

// Public rotalar
const PUBLIC_ROUTES = ['/login', '/register', '/reset-password', '/forget-password'] as const;

type Role = 'Admin' | 'User';

// Cookie’leri redirect/rewrited response’a taşı
function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) to.cookies.set(c);
  return to;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname, search } = req.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // NextRequest'ten tüm cookie'leri supabase'e ver
        getAll() {
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        // Supabase'in setmek istediği cookie'leri current response'a yaz
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Oturum
  const { data: { user } } = await supabase.auth.getUser();

  // Public sayfada loginli kullanıcıyı içeri salma
  if (user && PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    const r = NextResponse.redirect(new URL('/create_request', req.url));
    return withSupabaseCookies(res, r);
  }

  // Protected: kullanıcı yoksa login'e
  if (!user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', pathname + search);
    const r = NextResponse.redirect(loginUrl);
    return withSupabaseCookies(res, r);
  }

  // Yalnızca admin-only rotalarda rol kontrolü yap, her istekte DB dövmeyelim
  if (isAdminOnly(pathname)) {
    let role: Role | undefined =
      (user.app_metadata?.role as Role | undefined) ??
      (user.user_metadata?.role as Role | undefined);

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

    if (role !== 'Admin') {
      const r = NextResponse.redirect(new URL('/unauthorized', req.url));
      return withSupabaseCookies(res, r);
    }
  }

  return res;
}

// Yalnız bu yolları gerçekten koru (auth istemeyen public rotaları ekleme)
export const config = {
  matcher: [
    '/account',
    '/dashboard',
    '/create_request/:path*',
    '/requests/:path*',
    '/clients',
    '/products/:path*',     // gerekli; içinde 'new' ve '[id]/edit' admin-only
    '/orders/:path*',
    '/categories/:path*',
    '/admin/:path*',
  ],
};
