// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const providerError =
    searchParams.get('error_description') ?? searchParams.get('error');

  if (providerError) {
    // Google tarafı "access_denied" vs. gönderirse
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(providerError)}`);
  }

  if (!code) {
    // Supabase'e dönmediyse ya da param kayıpsa
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // 1) async fonksiyonu BEKLE
  // 2) cookie yazacağımız için write:true ver
  const supabase = await createSupabaseServerClient({ write: true });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Hata olursa login'e postalıyoruz
    return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed`);
  }

  // Başarılı: hesabına götür
  return NextResponse.redirect(`${origin}/account`);
}
