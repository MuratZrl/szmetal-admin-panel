// src/features/account/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import { AVATAR_ALLOWED_TYPES, AVATAR_MAX_SIZE } from '@/constants/account/upload';
import type { Database } from '@/types/supabase';

/** Ortak tipler */
export type ActionFail = { ok: false; message: string };
export type ActionResult<T = undefined> = ActionOk<T> | ActionFail;
export type ActionOk<T = undefined> = { ok: true; data?: T; message?: string };

export type CreateSignedUrlOutput = { path: string; token: string };
export type CreateSignedUrlInput = { extension: 'jpg' | 'png' | 'webp' };

export type UpdateProfileInput = {
  username: string;
  phone: string | null;
  company: string | null;
  country: string | null;
};

export type UploadAvatarResult = { publicUrl: string };

const BUCKET = 'avatars';

/* ----------------------------- Table types ----------------------------- */
type Users       = Database['public']['Tables']['users'];
type UsersRow    = Users['Row'];
type UsersUpdate = Users['Update'];
type UserId      = UsersRow['id'];

/* --------------------------- TS helpers --------------------------- */
// Postgrest zincirinde update/insert bazen `never` ister.
// Patch’i önce tablo tipine göre doğrula, sonra bilinçli `never` ver.
function asUpdateParam<T>(u: T) {
  return u as unknown as never;
}

/** Yardımcılar */
function isAllowedMime(mime: string): boolean {
  return (AVATAR_ALLOWED_TYPES as readonly string[]).includes(mime);
}
function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    default:           return 'bin';
  }
}

/** Public URL'den storage içi yolu çıkarır. */
function pathFromPublicUrl(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/';
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  // Örn: "avatars/abc-123.jpg"
  return publicUrl.substring(idx + marker.length);
}

export async function createAvatarSignedUrlAction(
  input: CreateSignedUrlInput
): Promise<ActionResult<CreateSignedUrlOutput>> {
  const supabase = await createSupabaseRouteClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, message: 'Oturum bulunamadı' };

  const uniq = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : String(Date.now());

  const path = `avatars/${user.id}-${uniq}.${input.extension}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path); // 60 sn
  if (error || !data?.token) return { ok: false, message: error?.message ?? 'İmzalı URL üretilemedi' };

  return { ok: true, data: { path, token: data.token } };
}

export async function finalizeAvatarAction(path: string): Promise<ActionResult<UploadAvatarResult>> {
  const supabase = await createSupabaseRouteClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, message: 'Oturum bulunamadı' };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) return { ok: false, message: 'Public URL üretilemedi' };

  const patch = { image: publicUrl as UsersRow['image'] } satisfies UsersUpdate;

  const { error: updErr } = await supabase
    .from('users')
    .update(asUpdateParam<UsersUpdate>(patch))
    .eq('id', user.id as UserId);

  if (updErr) return { ok: false, message: updErr.message };

  revalidatePath('/account');
  return { ok: true, data: { publicUrl }, message: 'Avatar güncellendi' };
}

/** Profil alanlarını güncelle */
export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResult> {
  const supabase = await createSupabaseRouteClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { ok: false, message: 'Oturum bulunamadı' };
  }

  const patch = {
    username: input.username,
    phone: input.phone,
    company: input.company,
    country: input.country,
  } satisfies UsersUpdate;

  const { error } = await supabase
    .from('users')
    .update(asUpdateParam<UsersUpdate>(patch))
    .eq('id', user.id as UserId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/account');
  return { ok: true, message: 'Bilgiler güncellendi' };
}

/** Avatar yükle (server-side doğrulama dahil) */
export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<UploadAvatarResult>> {
  const supabase = await createSupabaseRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, message: 'Oturum bulunamadı' };

  const raw = formData.get('file');
  if (!(raw instanceof File)) {
    return { ok: false, message: 'Dosya bulunamadı' };
  }

  const mime = raw.type;
  const size = raw.size;

  if (!isAllowedMime(mime)) {
    return { ok: false, message: 'Sadece JPG, PNG veya WEBP yüklenebilir' };
  }
  if (size > AVATAR_MAX_SIZE) {
    return { ok: false, message: "Dosya boyutu 5MB'ı geçemez" };
  }

  const uniq = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : String(Date.now());

  const ext = extFromMime(mime);
  const objectPath = `avatars/${user.id}-${uniq}.${ext}`;

  const { error: uploadErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(objectPath, raw, { upsert: false });

  if (uploadErr) return { ok: false, message: uploadErr.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) return { ok: false, message: 'Public URL üretilemedi' };

  const patch = { image: publicUrl as UsersRow['image'] } satisfies UsersUpdate;

  const { error: updErr } = await supabase
    .from('users')
    .update(asUpdateParam<UsersUpdate>(patch))
    .eq('id', user.id as UserId);

  if (updErr) {
    // Yüklenen objeyi temizlemeyi dene
    await supabase.storage.from(BUCKET).remove([objectPath]).catch(() => {});
    return { ok: false, message: updErr.message };
  }

  revalidatePath('/account');
  return { ok: true, data: { publicUrl }, message: 'Avatar yüklendi' };
}

/** Avatar sil */
export async function removeAvatarAction(): Promise<ActionResult> {
  const supabase = await createSupabaseRouteClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { ok: false, message: 'Oturum bulunamadı' };
  }

  const { data: row, error } = await supabase
    .from('users')
    .select('image')
    .eq('id', user.id as UserId)
    .single<Pick<UsersRow, 'image'>>();

  if (error) return { ok: false, message: error.message };

  const imageUrl: string | null = row?.image ?? null;
  if (!imageUrl) {
    return { ok: true, message: 'Zaten profil resmi yok' };
  }

  const path = pathFromPublicUrl(imageUrl);
  if (path) {
    const { error: delErr } = await supabase.storage.from(BUCKET).remove([path]);
    if (delErr) return { ok: false, message: delErr.message };
  }

  const patch = { image: null as UsersRow['image'] } satisfies UsersUpdate;

  const { error: updErr } = await supabase
    .from('users')
    .update(asUpdateParam<UsersUpdate>(patch))
    .eq('id', user.id as UserId);

  if (updErr) return { ok: false, message: updErr.message };

  revalidatePath('/account');
  return { ok: true, message: 'Profil resmi kaldırıldı' };
}

/** E-posta değiştir ve doğrulama maili gönder */
export async function changeEmailAction(email: string): Promise<ActionResult> {
  const supabase = await createSupabaseRouteClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { ok: false, message: 'Oturum bulunamadı' };
  }

  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/account`
    : undefined;

  const { error } = await supabase.auth.updateUser(
    { email },
    // redirectTo opsiyonel; env yoksa Supabase projenin default site URL’ini kullanır
    redirectTo ? { emailRedirectTo: redirectTo } : undefined
  );

  if (error) return { ok: false, message: error.message };

  return { ok: true, message: 'Doğrulama e-postası gönderildi' };
}

export type ChangePasswordInput = { currentPassword: string; newPassword: string };

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const supabase = await createSupabaseRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, message: 'Oturum bulunamadı' };
  if (!user.email) return { ok: false, message: 'Kullanıcı e-postası bulunamadı' };

  // Re-auth: mevcut parolayı doğrula
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.currentPassword,
  });

  if (signInErr) return { ok: false, message: 'Mevcut şifre hatalı' };

  // Şifreyi güncelle
  const { error: updErr } = await supabase.auth.updateUser({ password: input.newPassword });
  if (updErr) return { ok: false, message: updErr.message };

  return { ok: true, message: 'Şifre güncellendi' };
}
