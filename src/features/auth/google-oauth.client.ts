// src/features/auth/google-oauth.client.ts
'use client';

import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";

export async function handleGoogleOAuth(onError?: (msg: string) => void): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) {
    onError?.('Google ile oturum açılamadı.');
    throw error;
  }
}
