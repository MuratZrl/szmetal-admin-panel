// app/not-found.tsx
import * as React from 'react';
import AdminNotFound from './(admin)/not-found';
import AuthNotFound from './(auth)/not-found';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function GlobalNotFound(): Promise<React.JSX.Element> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const variant: 'admin' | 'auth' = user ? 'admin' : 'auth';

  // İki varyant DOM’da hazır; sadece görünürlüğü değiştiriyoruz.
  // styled-jsx yok; Server Component uyumlu.
  return (
    <div data-nf-variant={variant}>
      <div
        className="nf-admin"
        aria-hidden={variant !== 'admin'}
        hidden={variant !== 'admin'}
        style={variant !== 'admin' ? { display: 'none' } : undefined}
      >
        <AdminNotFound />
      </div>

      <div
        className="nf-auth"
        aria-hidden={variant !== 'auth'}
        hidden={variant !== 'auth'}
        style={variant !== 'auth' ? { display: 'none' } : undefined}
      >
        <AuthNotFound />
      </div>
    </div>
  );
}
