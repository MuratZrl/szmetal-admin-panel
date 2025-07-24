// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types/supabase'; // varsa, yoksa kaldır

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 🔒 Eğer kullanıcı login değilse → login sayfasına gönder
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = session.user;
  const role = user.user_metadata?.role || 'User';
  const pathname = req.nextUrl.pathname;

  // 🚫 Sadece adminlere açık sayfalar
  const adminOnlyPaths = [
    '/admin/dashboard',
    '/admin/clients',
    '/admin/requests',
    '/admin/products',
  ];

  // 👮‍♂️ Eğer User rolündeyse ve erişilmemesi gereken sayfaya girmeye çalışıyorsa
  if (role === 'User' && adminOnlyPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // ✅ Her şey normal, devam et
  return res;
}

export const config = {
  matcher: [
    // Koruma altına alınacak tüm sayfalar
    '/admin/:path*',
    '/clients',
    '/dashboard',
    '/requests',
    '/products',
    '/systems/:path*',
  ],
};
