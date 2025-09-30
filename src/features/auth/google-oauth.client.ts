// src/features/auth/google-oauth.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

function resolveBaseUrl(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Local ortamı açıkça tespit et
  const isLocal =
    origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  if (isLocal) return origin;

  // Prod için kanonik hostu kullan (env varsa), yoksa origin
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  return fromEnv || origin;
}

export async function handleGoogleOAuth(
  onError: (msg: string) => void,
  nextPath: string = '/account'
): Promise<void> {
  try {
    const base = resolveBaseUrl();
    const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    // Debug: yanlış hosta gidiyorsan buradan anlarsın
    // console.log('OAuth redirectTo =>', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });

    if (error) onError(`Google ile giriş başlatılamadı: ${error.message}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
    onError(`Google OAuth sırasında hata: ${msg}`);
  }
}
