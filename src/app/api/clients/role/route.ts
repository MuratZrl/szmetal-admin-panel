// app/api/clients/role/route.ts
import { NextResponse } from 'next/server';
import { object, string, mixed, ValidationError, type InferType } from 'yup';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

const ROLE_OPTIONS = ['Admin', 'Manager', 'User'] as const;
type AppRole = (typeof ROLE_OPTIONS)[number];

const BodySchema = object({
  userId: string().uuid().required('userId gerekli ve UUID olmalı'),
  role: mixed<AppRole>()
    .oneOf(ROLE_OPTIONS, 'Geçersiz rol')
    .required('role alanı zorunlu'),
})
  .noUnknown(true, 'Bilinmeyen alan geldi')
  .strict(true);

type Body = InferType<typeof BodySchema>;

function formatYupError(err: ValidationError) {
  return {
    message: 'Geçersiz istek gövdesi',
    errors: err.errors,
    field: err.path ?? null,
  };
}

// TS'i sakinleştir, 'any' kullanma:
function asRpcArgs<T>(v: T) {
  return (v as unknown) as never;
}

export async function POST(req: Request) {
  const supabase = await createSupabaseRouteClient();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  let body: Body;
  try {
    body = await BodySchema.validate(raw, { abortEarly: false });
  } catch (e: unknown) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: formatYupError(e) }, { status: 400 });
    }
    return NextResponse.json({ error: 'Doğrulama sırasında beklenmeyen hata' }, { status: 400 });
  }

  const { userId, role } = body;

  // Oturum kontrol (opsiyonel ama mantıklı)
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // İdeal tipli çağrı (tipler güncelse):
  // type Fn = Database['public']['Functions']['update_user_role'];
  // const args: Fn['Args'] = { target_user_id: userId, new_role: role as Fn['Args']['new_role'] };
  // const { data, error } = await supabase.rpc('update_user_role', args);

  // Tipler gecikiyorsa geçici çözüm:
  const { data, error } = await supabase.rpc(
    'update_user_role',
    asRpcArgs<{ target_user_id: string; new_role: AppRole }>({
      target_user_id: userId,
      new_role: role,
    })
  );

  if (error) {
    // RPC içinde admin kontrolü ve son admin koruması varsa 403 mantıklı
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ user: data }, { status: 200 });
}
