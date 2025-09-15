// app/api/users/role/route.ts
import { NextResponse } from 'next/server';
import {
  object, string, mixed, ValidationError, type InferType,
} from 'yup';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

const ROLE_OPTIONS = ['Admin', 'Manager', 'User', 'Banned'] as const;
type AppRole = typeof ROLE_OPTIONS[number];

// Body şeması (yup)
const BodySchema = object({
  userId: string().uuid().required('userId gerekli ve UUID olmalı'),
  role: mixed<AppRole>()
    .oneOf(ROLE_OPTIONS, 'Geçersiz rol')
    .required('role alanı zorunlu'),
})
  .noUnknown(true, 'Bilinmeyen alan geldi') // fazladan key gelirse hata
  .strict(true); // tip dönüşümü yapma, gelen neyse o

type Body = InferType<typeof BodySchema>;

function formatYupError(err: ValidationError) {
  // Çoklu hata olduğunda hepsini döndür
  return {
    message: 'Geçersiz istek gövdesi',
    errors: err.errors,
    field: err.path ?? null,
  };
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  let body: Body;
  try {
    // abortEarly:false => tüm doğrulama hatalarını topla
    body = await BodySchema.validate(raw, { abortEarly: false });
  } catch (e: unknown) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: formatYupError(e) }, { status: 400 });
    }
    return NextResponse.json({ error: 'Doğrulama sırasında beklenmeyen hata' }, { status: 400 });
  }

  const { userId, role } = body;

  // Supabase RPC: update_user_role(target_user_id uuid, new_role text)
  const { data, error } = await supabase.rpc('update_user_role', {
    target_user_id: userId,
    new_role: role,
  });

  if (error) {
    // RPC içinde admin kontrolü ve “son admin’i düşürme” koruması var
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ user: data }, { status: 200 });
}
