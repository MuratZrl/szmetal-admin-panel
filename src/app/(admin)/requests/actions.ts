// app/(admin)/requests/actions.ts
'use server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function approveRequest(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('requests').update({ status: 'approved' }).eq('id', requestId);
  if (error) throw new Error(error.message);
  return true;
}
