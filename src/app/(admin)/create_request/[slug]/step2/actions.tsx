// app/(admin)/create_request/[slug]/step2/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { promoteStep } from '@/features/create_request/services/ensureStep.server';
import { formDataToJson } from '@/utils/formDataToJson';
import { setFlowCookie } from '@/features/create_request/services/flowToken.server';

export async function submitStep2Action(slug: string, formData: FormData): Promise<never> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const formPayload = formDataToJson(formData);

  await supabase
    .from('system_drafts')
    .update({ form_data: formPayload })
    .eq('user_id', user.id)
    .eq('slug', slug);

  await promoteStep(slug, 3);

  // Burada yazmak serbest
  await setFlowCookie({ userId: user.id, slug, step: 3 });

  redirect(`/create_request/${slug}/step3`);
}
