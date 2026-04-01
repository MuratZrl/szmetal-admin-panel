// src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const res = NextResponse.redirect(new URL(next, req.url));

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          for (const c of list) {
            res.cookies.set(c.name, c.value, c.options);
          }
        },
      } satisfies CookieMethodsServer,
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }

  return res;
}
