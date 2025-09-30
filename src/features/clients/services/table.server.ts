// src/features/clients/services/table.server.ts
import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

/** UI DataGrid'in beklediği tip */
export type UserRow = {
  id: string;
  image: string | null;
  username: string | null;
  email: string;
  role: string | null;
  company: string | null;
  status: string | null;
  phone: string | null;
  country: string | null;
};

/** Sorgudan dönen satırların DB tabanlı seçimi */
type UsersSelectRow = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'image' | 'username' | 'email' | 'role' | 'company' | 'status' | 'phone' | 'country' | 'created_at'
>;

const FIELDS =
  'id, image, username, email, role, company, status, phone, country, created_at';

function mapRow(r: UsersSelectRow): UserRow {
  return {
    id: r.id,
    image: r.image ?? null,
    username: r.username ?? null,
    email: r.email,
    role: r.role ?? null,
    company: r.company ?? null,
    status: r.status ?? null,
    phone: r.phone ?? null,
    country: r.country ?? null,
  };
}

/** Bu dosyada lokal admin client (RLS by-pass). Client'a sızmaz. */
function createSupabaseServiceClientOrNull() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY; // .env.local gerekli
  if (!SRV) return null;
  return createClient<Database>(URL, SRV, { auth: { persistSession: false } });
}

/** Server client tipinden ortak 'from' imzasını al */
type QueryClient = Pick<Awaited<ReturnType<typeof createSupabaseServerClient>>, 'from'>;

/**
 * DataGrid için kullanıcılar.
 * limit verilirse sınırla, verilmezse parça parça tümünü getir.
 * Next önbelleğini kapat: her seferinde taze oku.
 */
export async function fetchUsersForGrid(limit?: number): Promise<UserRow[]> {
  noStore();

  const admin = createSupabaseServiceClientOrNull();

  // Union'u ortak arayüze daralt (any yok, unknown → QueryClient)
  const sb: QueryClient = admin
    ? (admin as unknown as QueryClient)
    : (await createSupabaseServerClient());

  // ESLint 'prefer-const' için yeniden atamaya gerek yok, base'i const tut
  const base = sb
    .from('users')
    .select(FIELDS)
    .order('created_at', { ascending: false, nullsFirst: false });

  if (Number.isFinite(limit)) {
    const { data, error } = await base
      .limit(Number(limit))
      .returns<UsersSelectRow[]>();

    if (error) {
      console.error('fetchUsersForGrid error:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  }

  // Limit verilmediyse hepsini pagineli topla (RLS kapalıysa gerçekten hepsi gelir)
  const PAGE = 1000;
  let from = 0;
  const all: UsersSelectRow[] = [];

  while (true) {
    const to = from + PAGE - 1;
    const { data, error } = await base
      .range(from, to)
      .returns<UsersSelectRow[]>();

    if (error) {
      console.error('fetchUsersForGrid page error:', error);
      break;
    }

    const chunk = data ?? [];
    all.push(...chunk);
    if (chunk.length < PAGE) break; // son sayfa
    from += PAGE;
  }

  return all.map(mapRow);
}

/** Hepsini getir (ad üstünde). Büyük tablolarda akıllıca kullan. */
export async function fetchUsersAll(): Promise<UserRow[]> {
  return fetchUsersForGrid(); // limitsiz, pagineli toplar
}

/** Geriye uyumluluk: 50 kayıtlık kısa liste isteyenler için. */
export async function fetchUsersTop50(): Promise<UserRow[]> {
  return fetchUsersForGrid(50);
}
