// src/hooks/useRequests.tsx
'use client';
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { RequestRowUnion } from '@/types/requests';

export function useRequests(initialRows: RequestRowUnion[] = []) {
  const [rows, setRows] = useState<RequestRowUnion[]>(initialRows);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          users ( id, username, email, company )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRows((data ?? []) as RequestRowUnion[]);
    } catch (err) {
      setError(err as Error);
      console.error('useRequests.refresh error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rows, setRows, loading, error, refresh } as const;
}
