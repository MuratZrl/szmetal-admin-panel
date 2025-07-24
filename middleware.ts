// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types/supabase' // Supabase tipi varsa, yoksa kaldırabilirsin

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Supabase istemcisi oluştur
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Oturum ve kullanıcı bilgilerini al
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Eğer oturum yoksa, login sayfasına yönlendir
  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const user = session.user

  // Supabase 'user_metadata' içindeki rolü al
  const userRole = user.user_metadata?.role || 'User'

  const pathname = req.nextUrl.pathname

  // Kullanıcının erişebileceği route'ları tanımla
  const userAllowedRoutes = ['/admin/account', '/admin/systems', '/admin/notifications']

  const isUser = userRole === 'User'

  // Eğer User rolünde ama yetkisiz bir admin sayfasına erişmek istiyorsa
  if (
    isUser &&
    pathname.startsWith('/admin') &&
    !userAllowedRoutes.includes(pathname)
  ) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Diğer durumlarda devam et
  return res
}

// Sadece admin sayfaları için çalışsın
export const config = {
  matcher: ['/admin/:path*'],
}
