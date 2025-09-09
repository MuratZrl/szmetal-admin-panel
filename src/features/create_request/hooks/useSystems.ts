// src/features/systems/hooks/useSystems.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { Database } from '@/types/supabase';
import type { SystemCardType } from '@/features/create_request/types/card';

type Row = Database['public']['Tables']['systems']['Row'];

function mapRowToCard(r: Row): SystemCardType {
  const labels = (r.button_labels ?? {}) as Record<string, unknown>;
  const links  = (r.links ?? {}) as Record<string, unknown>;

  return {
    id: r.slug,
    title: r.title,
    description: r.description ?? '',
    imageUrl: r.image_url ?? undefined,
    tag: r.tag ?? undefined,
    buttonLabels: {
      request: String(labels.request ?? 'Talep Oluştur'),
      primary: (labels.primary ?? labels.details) as string | undefined,
      secondary: labels.secondary as string | undefined,
    },
    links: {
      requestPage: String(links.requestPage ?? ''),
      details: links.details as string | undefined,
    },
    isActive: r.is_active ?? true,
    createdAt: r.created_at ?? undefined,
  };
}

export default function useSystems(initial?: SystemCardType[]) {
  const [systems, setSystems] = useState<SystemCardType[]>(initial ?? []);
  const [loading, setLoading]   = useState<boolean>(!initial || initial.length === 0);
  const [error, setError]       = useState<string | null>(null);

  const fetchSystems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('systems')
      .select('slug,title,description,tag,image_url,button_labels,links,is_active,created_at,meta')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setSystems([]);        // boşalt, skeleton yerine boş durum göstereceğiz
      setLoading(false);
      return;
    }

    setSystems((data ?? []).map(mapRowToCard));
    setLoading(false);
  }, []);

  // Boş diziyle de gelse client fetch et
  useEffect(() => {
    if (!initial || initial.length === 0) void fetchSystems();
  }, [initial, fetchSystems]);

  return { systems, loading, error, refresh: fetchSystems, setSystems };
}
