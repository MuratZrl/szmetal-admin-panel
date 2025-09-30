// src/features/clients/services/chart.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { STATUS_OPTIONS, type AppStatus } from '@/features/clients/constants/users';

export type ClientsLine6M = {
  labels: string[];                       // ["13 Nis", ...]
  totalUsers: number[];                   // toplam kullanıcı
  totalActiveUsers: number[];             // aktif kullanıcı
  byStatus: Record<AppStatus, number[]>;  // durum bazlı seriler
};

const IST_TZ = 'Europe/Istanbul';
const IST_OFFSET_MIN = 180; // UTC+3 kalıcı

/* ------------------------------ Date helpers ------------------------------ */
function getZonedYMD(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(date);
  const y = Number(parts.find(p => p.type === 'year')?.value ?? '1970');
  const m = Number(parts.find(p => p.type === 'month')?.value ?? '01');
  const d = Number(parts.find(p => p.type === 'day')?.value ?? '01');
  return { y, m, d };
}

function daysInMonthUTC(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1..12, 0 = prev month last day
}

function addMonthsClamp(y: number, m: number, d: number, delta: number): { y: number; m: number; d: number } {
  const idx = (m - 1) + delta;
  const y2 = y + Math.floor(idx / 12);
  const m2 = ((idx % 12) + 12) % 12 + 1;
  const dim = daysInMonthUTC(y2, m2);
  const d2 = Math.min(d, dim);
  return { y: y2, m: m2, d: d2 };
}

// Europe/Istanbul’da Y-M-D 00:00’ın denk geldiği UTC ISO anı
function istMidnightToUTCISO(y: number, m: number, d: number): string {
  // Yerel 00:00 (UTC+3) => UTC: önceki gün 21:00
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0);
  const adjusted = utcMs - IST_OFFSET_MIN * 60_000;
  return new Date(adjusted).toISOString();
}

const labelFmt = new Intl.DateTimeFormat('tr-TR', { timeZone: IST_TZ, day: '2-digit', month: 'short' });

type Cutoff = { y: number; m: number; d: number; iso: string; label: string };

function getLastNAnchoredCutoffs(n: number): Cutoff[] {
  const now = new Date();
  const { y, m, d } = getZonedYMD(now, IST_TZ);
  const items: Cutoff[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const t = addMonthsClamp(y, m, d, -i);
    const iso = istMidnightToUTCISO(t.y, t.m, t.d);
    const noonUTC = new Date(Date.UTC(t.y, t.m - 1, t.d, 12, 0, 0));
    const label = labelFmt.format(noonUTC);
    items.push({ ...t, iso, label });
  }

  return items;
}

/* ------------------------- Clients (typed the same) ------------------------ */
type Client = SupabaseClient<Database, 'public'>;

function createSupabaseServiceClient(): Client | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) return null;

  return createClient<Database, 'public'>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ------------------------------ Table types -------------------------------- */
type Users = Database['public']['Tables']['users'];
type UsersRow = Users['Row'];

/* ------------------------------ Count helpers ------------------------------ */
async function countTotalAt(client: Client, iso: string): Promise<number> {
  const { count, error } = await client
    .from('users')
    .select('id', { count: 'exact', head: true })
    .lte('created_at', iso);

  if (error) {
    console.error('countTotalAt error:', error);
    return 0;
  }
  return Number.isFinite(count as number) ? (count as number) : 0;
}

async function countByStatusAt(client: Client, status: AppStatus, iso: string): Promise<number> {
  const { count, error } = await client
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', status)
    .lte('created_at', iso);

  if (error) {
    console.error('countByStatusAt error:', status, error);
    return 0;
  }
  return Number.isFinite(count as number) ? (count as number) : 0;
}

/* --------------------------------- Service --------------------------------- */
/**
 * Not: Eğer RLS politikaların "sadece kendini gör" şeklindeyse,
 * toplamlar 1 gibi küçük sayılar verir. Aşağıdaki kod, oturum sahibinin
 * rolünü okur ve rol Admin ya da Manager ise, mevcutsa Service Role
 * ile sayım yapar. Böylece grafik gerçek toplamı gösterir.
 */
export async function fetchClientsLine6M(): Promise<ClientsLine6M> {
  
  // RLS client’ı tek tipe çevir (ssr client ile js client’ın tipleri nominal olarak farklı)
  const rlsClient = (await createSupabaseServerClient()) as unknown as Client;

  // Oturum + rol oku (RLS kendi satırını görür)
  const { data: { user } } = await rlsClient.auth.getUser();

  let myRole: 'Admin' | 'Manager' | 'User' | null = null;
  
  if (user) {
    const { data: me } = await rlsClient
      .from('users')
      .select('role')
      .eq('id', user.id as UsersRow['id'])
      .single<Pick<UsersRow, 'role'>>();

    myRole = (me?.role as 'Admin' | 'Manager' | 'User' | null) ?? null;
  }

  // Admin/Manager ise ve service key mevcutsa, sayımda service client kullan
  const svc = (myRole === 'Admin' || myRole === 'Manager') ? createSupabaseServiceClient() : null;
  const client: Client = svc ?? rlsClient;

  const cutoffs = getLastNAnchoredCutoffs(6);
  const labels = cutoffs.map(c => c.label);

  // Son nokta "şu an"
  const nowISO = new Date().toISOString();
  const cutoffISOForIndex = (idx: number): string =>
    idx === cutoffs.length - 1 ? nowISO : cutoffs[idx]!.iso;

  // Toplam ve Active
  const totalUsers = await Promise.all(
    cutoffs.map((_, i) => countTotalAt(client, cutoffISOForIndex(i)))
  );

  const totalActiveUsers = await Promise.all(
    cutoffs.map((_, i) => countByStatusAt(client, 'Active' as AppStatus, cutoffISOForIndex(i)))
  );

  // Durum bazlı
  const statuses: AppStatus[] = STATUS_OPTIONS.slice() as AppStatus[];
  const byStatusEntries = await Promise.all(
    statuses.map(async (status) => {
      const arr = await Promise.all(
        cutoffs.map((_, i) => countByStatusAt(client, status, cutoffISOForIndex(i)))
      );
      return [status, arr] as const;
    })
  );

  const byStatus = Object.fromEntries(byStatusEntries) as Record<AppStatus, number[]>;
  return { labels, totalUsers, totalActiveUsers, byStatus };
}
