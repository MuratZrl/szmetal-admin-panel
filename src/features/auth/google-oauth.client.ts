// src/features/auth/google-oauth.client.ts
'use client';

import { supabase } from '@/lib/supabase/supabaseClient';

export async function handleGoogleOAuth(
  onError: (msg: string) => void,
  nextPath: string = '/account'
): Promise<void> {
  try {
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });

    if (error) {
      onError(`Google ile giriş başlatılamadı: ${error.message}`);
    }
    // Not: Başarılıysa tarayıcı Google’a gider; burada bekleyecek bir şey yok.
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    onError(`Google OAuth sırasında hata: ${message}`);
  }
}
