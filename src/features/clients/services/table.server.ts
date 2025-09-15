// src/features/clients/services/table.server.ts
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

type UsersSelectRow = {
  id: string;
  image: string | null;
  username: string | null;
  email: string;
  role: string | null;
  company: string | null;
  status: string | null;
  phone: string | null;
  country: string | null;
  created_at?: string;
};

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

/**
 * DataGrid için kullanıcılar.
 * limit verilirse sınırla, verilmezse TÜM satırları getir.
 */
export async function fetchUsersForGrid(limit?: number): Promise<UserRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('users')
    .select('id, image, username, email, role, company, status, phone, country, created_at')
    .order('created_at', { ascending: false });

  if (typeof limit === 'number' && Number.isFinite(limit)) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('fetchUsersForGrid error:', error);
    return [];
  }

  const rows = (data ?? []) as UsersSelectRow[];
  return rows.map(mapRow);
}

/** Hepsini getir (ad üstünde). Büyük tablolarda aklın varsa bunu kullanma. */
export async function fetchUsersAll(): Promise<UserRow[]> {
  return fetchUsersForGrid(); // limitsiz
}

/** Geriye uyumluluk: 50 kayıtlık kısa liste isteyenler için. */
export async function fetchUsersTop50(): Promise<UserRow[]> {
  return fetchUsersForGrid(50);
}
