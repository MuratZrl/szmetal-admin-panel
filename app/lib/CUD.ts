// app/lib/CUD.ts
import type { DynamicRow } from '../(admin)/types/productsTypes';

import { supabase } from './supabase/supabaseClient';

export const insertRow = async (table: string, data: Partial<DynamicRow>) => {
  const { error } = await supabase.from(table).insert([data]);
  if (error) throw error;
};

export const updateRow = async (table: string, id: string, data: Partial<DynamicRow>) => {
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) throw error;
};

export const deleteRow = async (table: string, id: string, slug: string): Promise<boolean> => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('system_slug', slug);

  if (error) {
    console.error('Silme hatası:', error);
    return false;
  }

  return true;
};
