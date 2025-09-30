// app/(admin)/create_request/[slug]/step2/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { promoteStep } from '@/features/create_request/services/ensureStep.server';
import { formDataToJson } from '@/utils/formDataToJson';
import { setFlowCookie } from '@/features/create_request/services/flowToken.server';
import type { Database } from '@/types/supabase';

type SD = Database['public']['Tables']['system_drafts'];
type SDUpdate = SD['Update'];
type FormDataJson = SD['Row']['form_data'];

// “any” yok; ‘never’ ile derleyiciyi sakinleştiren yardımcı
function asUpdateParam<T>(u: T) {
  return (u as unknown) as never;
}

export async function submitStep2Action(slug: string, formData: FormData): Promise<never> {
  const supabase = await createSupabaseRouteClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const formPayload = formDataToJson(formData) as unknown as FormDataJson;

  const patch: SDUpdate = { form_data: formPayload };

  // DİKKAT: generic verme, tablo adını string literal olarak bırak
  const { error } = await supabase
    .from('system_drafts')
    .update(asUpdateParam<SDUpdate>(patch))
    .eq('user_id', user.id)
    .eq('slug', slug);

  if (error) throw new Error(error.message);

  await promoteStep(slug, 3);
  await setFlowCookie({ userId: user.id, slug, step: 3 });
  redirect(`/create_request/${slug}/step3`);
}
