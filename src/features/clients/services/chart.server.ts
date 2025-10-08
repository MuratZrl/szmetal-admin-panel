// src/features/clients/services/chart.server.ts
import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { STATUS_OPTIONS, type AppStatus } from '@/features/clients/constants/users';

export type ClientsLine6M = {
  labels: string[];                       // ["May", "Haz", ...]
  totalUsers: number[];                   // toplam kullanıcı (ay sonu)
  totalActiveUsers: number[];             // aktif kullanıcı (ay sonu, yaklaşık)
  byStatus: Record<AppStatus, number[]>;  // durum bazlı seriler (yaklaşık)
};

type Client = SupabaseClient<Database, 'public'>;

const IST_TZ = 'Europe/Istanbul';
const IST_OFFSET_MIN = 180; // UTC+3 kalıcı

/* ------------------------------ Date helpers ------------------------------ */

// Verili timeZone'da bugünün Y-M-D'si
function getZonedYMD(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(date);
  const y = Number(parts.find(p => p.type === 'year')?.value ?? '1970');
  const m = Number(parts.find(p => p.type === 'month')?.value ?? '01');
  const d = Number(parts.find(p => p.type === 'day')?.value ?? '01');
  return { y, m, d };
}

// Ay ekle/çıkar (1..12 içinde normalize)
function addMonths(y: number, m: number, delta: number): { y: number; m: number } {
  const idx = (m - 1) + delta;
  const y2 = y + Math.floor(idx / 12);
  const m2 = ((idx % 12) + 12) % 12 + 1;
  return { y: y2, m: m2 };
}

// TR’de Y-M-D 00:00 → UTC ISO
function istMidnightToUTCISO(y: number, m: number, d: number): string {
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0);
  const adjusted = utcMs - IST_OFFSET_MIN * 60_000; // UTC+3 → UTC
  return new Date(adjusted).toISOString();
}

const monthLabelFmt = new Intl.DateTimeFormat('tr-TR', { timeZone: IST_TZ, month: 'short' });

type Cutoff = { iso: string; label: string };

/** Son N ay için “ay sonu toplamı” kesitleri:
 *  - Her ay için cutoff = bir sonraki ayın 1’i TR 00:00 (exclusive)
 *  - Son kesit = now (mevcut ay canlı)
 */
function getLastNMonthCutoffs(n: number): Cutoff[] {
  const now = new Date();
  const { y, m } = getZonedYMD(now, IST_TZ);

  const arr: Cutoff[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const base = addMonths(y, m, -i);                // i ay önceki ay
    const next = addMonths(base.y, base.m, +1);      // bir sonraki ay
    const iso = istMidnightToUTCISO(next.y, next.m, 1); // o ayın sonu (exclusive)
    const label = monthLabelFmt.format(new Date(Date.UTC(base.y, base.m - 1, 15, 12)));
    arr.push({ iso, label });
  }

  // Son noktayı “şu an” yap
  arr[arr.length - 1]!.iso = now.toISOString();
  return arr;
}

/* --------------------------- Supabase client(s) --------------------------- */

function createSupabaseServiceClient(): Client | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient<Database, 'public'>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ------------------------------ Count helpers ------------------------------ */

async function countTotalBefore(client: Client, isoExclusive: string): Promise<number> {
  const { count, error } = await client
    .from('users')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', isoExclusive); // exclusive cutoff

  if (error) {
    console.error('countTotalBefore error:', error);
    return 0;
  }
  return Number.isFinite(count as number) ? (count as number) : 0;
}

async function countByStatusBefore(client: Client, status: AppStatus, isoExclusive: string): Promise<number> {
  const { count, error } = await client
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', status)
    .lt('created_at', isoExclusive); // exclusive cutoff

  if (error) {
    console.error('countByStatusBefore error:', status, error);
    return 0;
  }
  return Number.isFinite(count as number) ? (count as number) : 0;
}

/* --------------------------------- Service --------------------------------- */

export async function fetchClientsLine6M(): Promise<ClientsLine6M> {
  // RLS client
  const rlsClient = (await createSupabaseServerClient()) as unknown as Client;

  // Rolü oku, uygunsa service role kullan
  const { data: { user } } = await rlsClient.auth.getUser();
  let myRole: 'Admin' | 'Manager' | 'User' | null = null;
  if (user) {
    const { data: me } = await rlsClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<Pick<Database['public']['Tables']['users']['Row'], 'role'>>();
    myRole = (me?.role as 'Admin' | 'Manager' | 'User' | null) ?? null;
  }

  const svc = (myRole === 'Admin' || myRole === 'Manager') ? createSupabaseServiceClient() : null;
  const client: Client = svc ?? rlsClient;

  // Kesitler ve etiketler
  const cutoffs = getLastNMonthCutoffs(6);
  const labels = cutoffs.map(c => c.label);

  // Toplamlar
  const totalUsers = await Promise.all(cutoffs.map(c => countTotalBefore(client, c.iso)));
  const totalActiveUsers = await Promise.all(cutoffs.map(c => countByStatusBefore(client, 'Active', c.iso)));

  // Durum bazlı seriler
  const statuses = STATUS_OPTIONS.slice() as AppStatus[];
  const byStatusEntries = await Promise.all(
    statuses.map(async (status) => {
      const arr = await Promise.all(cutoffs.map(c => countByStatusBefore(client, status, c.iso)));
      return [status, arr] as const;
    })
  );
  const byStatus = Object.fromEntries(byStatusEntries) as Record<AppStatus, number[]>;

  return { labels, totalUsers, totalActiveUsers, byStatus };
}
