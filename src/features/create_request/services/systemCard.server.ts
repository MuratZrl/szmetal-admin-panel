// src/features/systems/services/systems.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';
import type { SystemCardType } from '@/features/create_request/types/card';

type Row = Database['public']['Tables']['systems']['Row'];

function mapRowToCard(r: Row): SystemCardType {
  const labels = (r.button_labels ?? {}) as Record<string, unknown>;
  const links  = (r.links ?? {}) as Record<string, unknown>;

  return {
    id: r.slug, // slug'ı id olarak kullan
    
    title: r.title,
    
    description: r.description ?? '',
    
    imageUrl: r.image_url ?? undefined,
    
    tag: r.tag ?? undefined,
    
    buttonLabels: {
      request: String(labels.request ?? 'Talep Oluştur'),
      primary: (labels.primary ?? labels.details) as string | undefined,   // eski “details” için uyum
      secondary: labels.secondary as string | undefined,
    },

    links: {
      requestPage: String(links.requestPage ?? ''),                        // zorunlu
      details: links.details as string | undefined,                        // opsiyonel
    },

    isActive: r.is_active ?? true,
    createdAt: r.created_at ?? undefined,
  };
}

export async function fetchSystems(): Promise<SystemCardType[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from('systems')
    .select('slug, title, description, tag, image_url, button_labels, links, is_active, created_at, meta')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`systems fetch failed: ${error.message}`);
  }
  return (data ?? []).map(mapRowToCard);
}
