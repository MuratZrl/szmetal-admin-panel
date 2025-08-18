// server-side
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { RequestRowUnion } from '@/types/requests';

export async function fetchAllRequests(): Promise<RequestRowUnion[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('requests')
    .select(`
       *,
       users ( id, username, email, company )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as RequestRowUnion[];
}
