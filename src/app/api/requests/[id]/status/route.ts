import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { RequestStatus } from '@/features/requests/types';

function parseStatus(v: unknown): RequestStatus | null {
  const s = typeof v === 'string' ? v.toLowerCase().trim() : '';
  if (s === 'approved' || s === 'rejected' || s === 'pending') return s;
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ← burada Promise
) {
  const { id } = await params; // ← önce await et

  const body = (await req.json().catch(() => null)) as unknown;
  
  const statusInput =
    typeof body === 'object' && body !== null && 'status' in (body as Record<string, unknown>)
      ? (body as Record<string, unknown>).status
      : null;

  const status = parseStatus(statusInput);

  if (!status) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'update_failed' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id, status: data.status as RequestStatus });
}
