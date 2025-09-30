// src/features/account/services/getAccountData.server.ts
// 'use server'; // ister kalsın ister sil, bu bir server-only yardımcı modül

import type { Database } from '@/types/supabase';
import type { UserData } from '@/features/account/hooks/useAccount';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer'; // ← değişti

type RowPick = Pick<
  Database['public']['Tables']['users']['Row'],
  'image' | 'username' | 'email' | 'role' | 'phone' | 'company' | 'country'
>;

export async function getAccountData() {
  const supabase = await createSupabaseServerClient(); // ← read-only client

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as UserData | null };

  const { data, error } = await supabase
    .from('users')
    .select('image, username, email, role, phone, company, country')
    .eq('id', user.id)
    .single<RowPick>();

  if (error || !data) {
    return { user, profile: null as UserData | null };
  }

  const profile: UserData = {
    image: data.image,
    username: data.username,
    email: data.email,
    role: data.role,
    phone: data.phone,
    company: data.company,
    country: data.country,
  };

  return { user, profile };
}
