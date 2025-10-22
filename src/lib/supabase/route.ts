// src/lib/supabase/route.ts
/**
 * Bu dosya yalnızca geriye dönük uyumluluk için tutuluyor.
 * Tüm gerçek implementasyon supabaseServer.ts içindedir.
 * Böylece tek yerden konfigürasyon yapılır, drift oluşmaz.
 */
export { createSupabaseRouteClient as createRouteClient } from './supabaseServer';
export type { SupabaseRouteClient as RouteSupabaseClient } from './supabaseServer';
