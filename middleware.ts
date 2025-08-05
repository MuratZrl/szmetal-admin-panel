// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set(name, value, options)
        },
        remove(name, options) {
          res.cookies.set(name, '', { ...options, maxAge: -1 })
        },
      }
    }
  )

  // 🔑 Supabase user oturumu al
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 🧠 Şimdi "users" tablosundan kullanıcı rolünü al
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error('Rol bilgisi alınamadı:', error)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  const role = userData.role
  const pathname = req.nextUrl.pathname

    // ✅ Kullanıcı giriş yaptıysa /auth sayfalarına erişemesin
  if (user && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/systems', req.url))
  }

  // 🚫 Sadece admin'lere özel sayfalar
  const adminOnlyPaths = [
    '/dashboard',
    '/requests',
    '/clients',
    '/products',
    '/categories',
    '/admin',
  ]

  const isRestricted = adminOnlyPaths.some(path => pathname.startsWith(path))

  if (role !== 'Admin' && isRestricted) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/account',
    '/dashboard',
    '/systems/:path*',    // ✅ dinamik slug dahil
    '/requests/:path*',   // ✅ dinamik id dahil
    '/clients',
    '/products/:path*',   // ✅ dinamik slug dahil
    '/orders/:path*',   // ✅ dinamik slug dahil
    '/categories/:path*',
    '/admin/:path*',
    
    '/auth/:path*', // 👈 bunu ekledik
  ],
}
