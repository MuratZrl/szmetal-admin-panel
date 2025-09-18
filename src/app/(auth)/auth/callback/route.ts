// app/(auth)/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const errorDesc = url.searchParams.get('error_description');
  const next = url.searchParams.get('next') ?? '/account';

  if (errorDesc) {
    // Google/Supabase hata döndürdüyse login’e geri postalıyoruz
    const dest = new URL(`/login?error=${encodeURIComponent(errorDesc)}`, url.origin);
    return NextResponse.redirect(dest);
  }

  if (!code) {
    // Code yoksa zaten yapacak iş de yok
    const dest = new URL('/login?error=OAuth%20code%20bulunamad%C4%B1', url.origin);
    return NextResponse.redirect(dest);
  }

  const supabase = await createSupabaseServerClient();

  // Koddan session üret; cookie’ler otomatik set edilir (server client bunu halleder)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const dest = new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin);
    return NextResponse.redirect(dest);
  }

  // İstersen burada kullanıcıyı ilk kez görüyorsan public.users içine profil açma vs. yapabilirsin.

  // Son varış: butonda verdiğimiz nextPath. Tutarlı olmak adına /account kullandım.
  const dest = new URL(next, url.origin);
  return NextResponse.redirect(dest);
}
