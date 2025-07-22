// app/lib/CUD.ts
import type { DynamicRow } from '../(admin)/types/productsTypes';

import { supabase } from './supabaseClient';

export const insertRow = async (table: string, data: Partial<DynamicRow>) => {
  const { error } = await supabase.from(table).insert([data]);
  if (error) throw error;
};

export const updateRow = async (table: string, id: string, data: Partial<DynamicRow>) => {
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) throw error;
};

export const deleteRow = async (table: string, id: string, slug: string) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('system_slug', slug); // slug kontrolü de eklendi

  if (error) {
    console.error('Silme hatası:', error);
    throw new Error(error.message);
  }
};
