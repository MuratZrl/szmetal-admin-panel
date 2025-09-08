// src/features/requests/services/requests.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { RequestRowUnion } from '../types';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export async function fetchRequestById(id: string | string): Promise<RequestRowUnion | null> {
  const sb = await createSupabaseServerClient();

  const { data, error } = await sb
    .from('requests')
    .select(`
      *,
      users (
        username,
        email,
        company,
        country
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as RequestRowUnion) ?? null;
}

export async function updateRequestStatus(
  id: string,
  newStatus: RequestStatus
): Promise<void> {
  const sb = await createSupabaseServerClient();

  // 1) Güncelle
  const { error: upErr } = await sb.from('requests').update({ status: newStatus }).eq('id', id);
  if (upErr) throw upErr;

  // 2) Bildirim/Order kaydı (senin kodundaki tabloyla uyumlu)
  const { data: req, error: getErr } = await sb
    .from('requests')
    .select('user_id, system_slug')
    .eq('id', id)
    .maybeSingle();
  if (getErr || !req) throw getErr ?? new Error('Request not found');

  const systemName = (req.system_slug as string).replace(/-/g, ' ');
  const title =
    newStatus === 'approved' ? 'Talebiniz Onaylandı' : 'Talebiniz Reddedildi';
  const message =
    newStatus === 'approved'
      ? `Yapmış olduğunuz ${systemName} sistemi talebi başarılı bir şekilde onaylanmıştır.`
      : `Yapmış olduğunuz ${systemName} sistemi talebi maalesef reddedilmiştir.`;

  // Not: Sidebar’ınız bazı yerlerde notifications, bazı yerlerde orders’ı kullanıyor.
  // Burada mevcut sayfadaki mantığı bozmayıp orders’a yazıyorum.
  const { error: insErr } = await sb.from('orders').insert([
    {
      user_id: req.user_id,
      title,
      message,
      type: newStatus === 'approved' ? 'success' : 'rejected',
    },
  ]);
  if (insErr) throw insErr;
}
