// src/lib/supabase/supabaseAdmin.ts
import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * ensureAdminEnv
 * --------------
 * • Service role key ve URL’nin mevcut olduğunu doğrular.
 * • Eksikse net bir hata fırlatır (erken ve gürültülü patla).
 */
function ensureAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error('[supabaseAdmin] Gerekli env yok: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  return { url, service };
}

/**
 * createSupabaseAdminClient
 * -------------------------
 * • Kullanım yeri: SADECE Server (Node.js) runtime. Kesinlikle client/edge değil.
 * • Key: SUPABASE_SERVICE_ROLE_KEY kullanır. Bu anahtar RLS’i by-pass eder.
 * • Ne için:
 *    - Arkaplan işler, cron, yönetim panelinin “idari” işlemleri,
 *      migration/seed, sistem içi bakım görevleri.
 * • Ne için DEĞİL:
 *    - Kullanıcı girdisini olduğu gibi işlemek.
 *    - Client’ta ya da Edge’de çağırmak (güvenlik açığı).
 * • Tasarım:
 *    - Singleton: HMR/çoklu çağrıda aynı client geri döner.
 */
let _adminClient: SupabaseClient<Database> | null = null;

export function createSupabaseAdminClient() {
  if (_adminClient) return _adminClient;
  const { url, service } = ensureAdminEnv();
  _adminClient = createClient<Database, 'public'>(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  });
  return _adminClient;
}
