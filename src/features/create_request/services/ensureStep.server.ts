// src/features/create_request/services/ensureStep.server.ts
import 'server-only';
import { redirect } from 'next/navigation';
import { readFlowCookie } from './flowToken.server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

type Step = 1 | 2 | 3;

/* --------------------------- Table types --------------------------- */
type Drafts    = Database['public']['Tables']['system_drafts'];
type DraftRow  = Drafts['Row'];
type DraftIns  = Drafts['Insert'];
type DraftUpd  = Drafts['Update'];

/* -------- Postgrest'in update/insert never kaprisini susturucu -------- */
function asWriteParam<T>(v: T) {
  return v as unknown as never;
}

export async function ensureStep(
  slug: string,
  stepMin: Step
): Promise<{ draft: DraftRow; needsCookieSync: boolean }> {

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirectedFrom=/create_request/${slug}/step${stepMin}`);

  // mevcut draft
  const { data: found } = await supabase
    .from('system_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle<DraftRow>();

  let draft = found ?? null;

  // stepMin=2 ise, draft yoksa oluştur
  if (!draft && stepMin === 2) {
    const payload = {
      user_id: user.id as DraftRow['user_id'],
      slug,
      step: 2 as DraftRow['step'],
      form_data: {} as DraftRow['form_data'],
    } satisfies DraftIns;

    const { data: inserted, error: insErr } = await supabase
      .from('system_drafts')
      .insert(asWriteParam<DraftIns>(payload))
      .select('*')
      .single<DraftRow>();

    if (insErr || !inserted) redirect('/create_request?reason=draft_create_failed');
    draft = inserted;
  }

  if (!draft) redirect('/create_request?reason=no_draft');

  // step 1'den 2'ye terfi
  if (stepMin === 2 && draft.step === 1) {
    const patch = { step: 2 as DraftUpd['step'] } satisfies DraftUpd;

    const { data: upd } = await supabase
      .from('system_drafts')
      .update(asWriteParam<DraftUpd>(patch))
      .eq('user_id', user.id)
      .eq('slug', slug)
      .select('*')
      .single<DraftRow>();

    draft = upd ?? draft;
  }

  // step 3 zorunluluğu
  if (stepMin === 3 && (draft.step as Step) < 3) {
    redirect(`/create_request/${slug}/step2?reason=insufficient_step`);
  }

  // Sadece durum tespiti
  const token = await readFlowCookie();
  const needsCookieSync =
    !token || token.userId !== user.id || token.slug !== slug || token.step < (draft.step as Step);

  return { draft, needsCookieSync };
}

export async function promoteStep(slug: string, to: Step): Promise<DraftRow> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED');

  // Mevcut draftı al
  const { data: draft, error: findErr } = await supabase
    .from('system_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle<DraftRow>();

  if (findErr) throw new Error(`DRAFT_FETCH_FAILED: ${findErr.message}`);
  if (!draft) throw new Error('DRAFT_NOT_FOUND');

  // Geri düşürme yok
  const next: Step = Math.max(draft.step as Step, to) as Step;
  if (next === (draft.step as Step)) return draft;

  const patch = { step: next as DraftUpd['step'] } satisfies DraftUpd;

  const { data: updated, error: updErr } = await supabase
    .from('system_drafts')
    .update(asWriteParam<DraftUpd>(patch))
    .eq('user_id', user.id)
    .eq('slug', slug)
    .select('*')
    .single<DraftRow>();

  if (updErr || !updated) {
    throw new Error(`STEP_UPDATE_FAILED: ${updErr?.message ?? 'unknown'}`);
  }

  return updated;
}
