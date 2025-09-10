// src/features/create_request/services/ensureStep.server.ts
import 'server-only';
import { redirect } from 'next/navigation';
import { readFlowCookie } from './flowToken.server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type Row = Database['public']['Tables']['system_drafts']['Row'];
type Step = 1 | 2 | 3;

export async function ensureStep(
  slug: string,
  stepMin: Step
): Promise<{ draft: Row; needsCookieSync: boolean }> {
  
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirectedFrom=/create_request/${slug}/step${stepMin}`);

  const { data: found } = await supabase
    .from('system_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle<Row>();

  let draft = found ?? null;

  if (!draft && stepMin === 2) {
    const { data: inserted, error: insErr } = await supabase
      .from('system_drafts')
      .insert({ user_id: user.id, slug, step: 2, form_data: {} })
      .select('*')
      .single<Row>();
    if (insErr || !inserted) redirect('/create_request?reason=draft_create_failed');
    draft = inserted;
  }

  if (!draft) redirect('/create_request?reason=no_draft');

  if (stepMin === 2 && draft.step === 1) {
    const { data: upd } = await supabase
      .from('system_drafts')
      .update({ step: 2 })
      .eq('user_id', user.id)
      .eq('slug', slug)
      .select('*')
      .single<Row>();
    draft = upd ?? draft;
  }

  if (stepMin === 3 && draft.step < 3) {
    redirect(`/create_request/${slug}/step2?reason=insufficient_step`);
  }

  // Sadece durum tespiti
  const token = await readFlowCookie();
  const needsCookieSync =
    !token || token.userId !== user.id || token.slug !== slug || token.step < (draft.step as Step);

  return { draft, needsCookieSync };
}

export async function promoteStep(slug: string, to: Step): Promise<Row> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  // Mevcut draftı al
  const { data: draft, error: findErr } = await supabase
    .from('system_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle<Row>();

  if (findErr) {
    throw new Error(`DRAFT_FETCH_FAILED: ${findErr.message}`);
  }
  if (!draft) {
    // İstersen burada insert ile oluşturabilirsin.
    // Şimdilik net konuşalım:
    throw new Error('DRAFT_NOT_FOUND');
  }

  // Geri düşürme yok
  const next: Step = (Math.max(draft.step as Step, to) as Step);
  if (next === draft.step) {
    return draft; // Zaten yeterince ileride
  }

  const { data: updated, error: updErr } = await supabase
    .from('system_drafts')
    .update({ step: next })
    .eq('user_id', user.id)
    .eq('slug', slug)
    .select('*')
    .single<Row>();

  if (updErr || !updated) {
    throw new Error(`STEP_UPDATE_FAILED: ${updErr?.message ?? 'unknown'}`);
  }

  return updated;
}