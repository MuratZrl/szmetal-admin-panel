// src/features/orders/types.ts
import type { Database } from '@/types/supabase';

// Supabase'teki orders satırı + "tille" yazım kazasına tolerans
export type OrderRow = Database['public']['Tables']['orders']['Row'] & {
  title?: string | null;
  tille?: string | null;
};
