// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types/supabase'; // varsa

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Eğer oturum yoksa => login'e yönlendir
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const user = session.user;
  const role = user.user_metadata?.role || 'User';

  const pathname = req.nextUrl.pathname;

  // ❌ User rolü için yasaklı admin route'ları (kesinlikle erişilmesin)
  const forbiddenForUser = [
    '/admin/dashboard',
    '/admin/clients',
    '/admin/requests',
    '/admin/products',
  ];

  if (role === 'User' && forbiddenForUser.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/clients',
    '/dashboard',
    '/requests',
    '/products',
  ],
}