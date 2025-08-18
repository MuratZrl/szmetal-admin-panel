// src/types/requestsTypes.ts
import type { Database } from '@/types/supabase';

export type UserRow = Database['public']['Tables']['users']['Row'];
export type RequestRow = Database['public']['Tables']['requests']['Row'];

/**
 * RequestRowUnion: requests tablosu satırı + ilişkili kullanıcı bilgisi (users)
 * Supabase select(`*, users ( username, email, company )`) gibi bir sorgu döndürdüğü şekli temsil eder.
 */
export type RequestRowUnion = RequestRow & {
  users?: Pick<UserRow, 'id' | 'username' | 'email' | 'company'> | null;
};

/** Props tipleri */
export type RequestsStatsProps = {
  rows: RequestRowUnion[];
};

export type RequestsChartsProps = {
  rows: RequestRowUnion[];
};
