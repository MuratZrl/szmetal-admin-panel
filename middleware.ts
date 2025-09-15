// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminOnly } from '@/lib/supabase/auth/routeGuards';

// Public sayfalar (middleware çalışmasın)
const PUBLIC_ROUTES = new Set<string>([
  '/login',
  '/register',
  '/reset-password',
  '/forget-password',
  '/banned',
]);

type Role = 'Admin' | 'Manager' | 'User';

// Supabase'in response'a yazdığı cookie'leri redirect/return edeceğin response'a taşı
function withSupabaseCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c);
  }
  return to;
}

export async function middleware(req: NextRequest) {
  // Bu response üstünde Supabase cookie yazacak
  const nextRes = NextResponse.next();
  const { pathname, search } = req.nextUrl;

  // Public rota ise middleware çalışmıyor (matcher'dan dolayı),
  // ama yine de savunmacı olalım:
  if (PUBLIC_ROUTES.has(pathname)) {
    return nextRes;
  }

  // Supabase SSR client (cookie köprüsü)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // NextRequest cookies → Supabase formatına çevir
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        setAll(cookies) {
          // Supabase'in yazmak istediği cookie'leri current response'a bas
          cookies.forEach(({ name, value, options }) => {
            nextRes.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Oturum bilgisini al
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Oturum yoksa: login'e
  if (!user) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirectedFrom', pathname + search);
    const r = NextResponse.redirect(url);
    return withSupabaseCookies(nextRes, r);
  }

  // Oturum var: DB'den status ve role çek
  const { data: me, error } = await supabase
    .from('users')
    .select('status, role')
    .eq('id', user.id)
    .single();

  // Banned ise: oturumu kapat ve /banned
  if (!error && me?.status === 'Banned') {
    await supabase.auth.signOut();
    const r = NextResponse.redirect(new URL('/banned', req.url));
    return withSupabaseCookies(nextRes, r);
  }

  // Admin-only rotalarda Admin zorunlu
  if (isAdminOnly(pathname)) {
    const role: Role | undefined =
      (user.app_metadata?.role as Role | undefined) ??
      (user.user_metadata?.role as Role | undefined) ??
      (me?.role as Role | undefined);

    if (role !== 'Admin') {
      const r = NextResponse.redirect(new URL('/unauthorized', req.url));
      return withSupabaseCookies(nextRes, r);
    }
  }

  // Her şey yolunda: devam
  return nextRes;
}

// Sadece korumalı rotalara çalışsın.
// Public'leri buraya ekleme ki sonsuz redirect olmasın.
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
  ],
};
