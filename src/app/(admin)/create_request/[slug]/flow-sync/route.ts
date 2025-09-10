// src/app/(admin)/create_request/[slug]/flow-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { setFlowCookieOnResponse } from '@/features/create_request/services/flowToken.server';

type Params = { slug: string };
type Step = 1 | 2 | 3;

function normalizeStep(v: string | null): Step {
  const n = Number.parseInt(v ?? '1', 10);
  return (n === 3 ? 3 : n === 2 ? 2 : 1) as Step;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<Params> }   // ← Promise olarak tanımla
) {
  const { slug } = await ctx.params; // ← önce await et

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const url = new URL(req.url);
  const step = normalizeStep(url.searchParams.get('step'));
  const to = url.searchParams.get('to') || 'step2';

  if (!user) {
    return NextResponse.redirect(new URL(`/auth/login?redirectedFrom=/create_request/${slug}/${to}`, req.url));
  }

  const res = NextResponse.redirect(new URL(`/create_request/${slug}/${to}`, req.url));
  await setFlowCookieOnResponse(res, { userId: user.id, slug, step });
  return res;
}
