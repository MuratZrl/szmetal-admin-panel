import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';
import { setFlowCookieOnResponse } from '@/features/create_request/services/flowToken.server';
import { fetchSystemFormConfig } from '@/features/create_request/services/step2RequestForm.server';
import type { Json } from '@/types/supabase';
import * as yup from 'yup';

type Body = { slug: string; form: { [key: string]: Json } };
type Step = 1 | 2 | 3;

// Same-origin: origin/referrer sunucunun host’u ile eşleşmeli
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
  const originHost = origin ? new URL(origin).host : null;
  const refererHost = referer ? new URL(referer).host : null;
  if (!host) return false;
  return originHost === host || refererHost === host;
}

// Config’ten yup şeması üret
function schemaFromConfig(cfg: { fields: Array<{
  name: string; label: string; type?: 'text' | 'textarea' | 'number' | 'date';
  required?: boolean; min?: number; max?: number;
}>}) {
  const shape: Record<string, yup.AnySchema> = {};
  for (const f of cfg.fields) {
    if (f.type === 'number') {
      let s = yup.number().transform((v, ov) => (ov === '' || ov == null ? undefined : v));
      if (f.required) s = s.required('Zorunlu');
      if (typeof f.min === 'number') s = s.min(f.min);
      if (typeof f.max === 'number') s = s.max(f.max);
      shape[f.name] = s;
    } else {
      let s = yup.string().transform(v => (v == null ? '' : String(v))).trim();
      if (f.required) s = s.required('Zorunlu');
      if (typeof f.min === 'number') s = s.min(f.min);
      if (typeof f.max === 'number') s = s.max(f.max);
      shape[f.name] = s;
    }
  }
  return yup.object().shape(shape).noUnknown(true).strict(false);
}

// app/api/systems/draft/route.ts (POST)
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  if (!isSameOrigin(req)) return NextResponse.json({ error: 'CSRF_BLOCKED' }, { status: 403 });

  const ctype = req.headers.get('content-type') ?? '';
  if (!ctype.includes('application/json')) {
    return NextResponse.json({ error: 'UNSUPPORTED_CONTENT_TYPE', expected: 'application/json' }, { status: 415 });
  }

  const { slug, form } = (await req.json()) as Body;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'INVALID_SLUG' }, { status: 400 });
  }

  const cfg = await fetchSystemFormConfig(slug);
  
  if (!cfg?.fields?.length) {
    return NextResponse.json({ error: 'UNKNOWN_SYSTEM' }, { status: 404 });
  }

  const schema = schemaFromConfig(cfg);

  try {
    const parsed = await schema.validate(form, { abortEarly: false, stripUnknown: true });

    // TEK ATIŞTA OLUŞTUR/GÜNCELLE + STEP=3
    const { data: row, error: upsertErr } = await supabase
      .from('system_drafts')
      .upsert(
        {
          user_id: user.id,
          slug,
          form_data: parsed as Record<string, Json>,
          step: 3 as Step,
        },
        { onConflict: 'user_id,slug' } // composite key’in buysa
      )
      .select('step')
      .single();

    if (upsertErr || !row) {
      return NextResponse.json({ error: upsertErr?.message ?? 'UPSERT_FAILED' }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, step: row.step as Step });
    await setFlowCookieOnResponse(res, { userId: user.id, slug, step: 3 });
    return res;

  } catch (e) {
    const ve = e as yup.ValidationError;
    const details = ve.inner?.length
      ? ve.inner.map(x => ({ path: x.path, message: x.message }))
      : [{ path: ve.path, message: ve.message }];

    return NextResponse.json({ error: 'VALIDATION_FAILED', details }, { status: 400 });
  }
}

type DeleteBody = { slug: string };
export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'CSRF_BLOCKED' }, { status: 403 });

  const ctype = req.headers.get('content-type') ?? '';
  if (!ctype.includes('application/json')) {
    return NextResponse.json({ error: 'UNSUPPORTED_CONTENT_TYPE', expected: 'application/json' }, { status: 415 });
  }

  const { slug } = (await req.json()) as DeleteBody;
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'INVALID_SLUG' }, { status: 400 });
  }

  const { error: delErr } = await supabase
    .from('system_drafts')
    .delete()
    .eq('user_id', user.id)
    .eq('slug', slug);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
