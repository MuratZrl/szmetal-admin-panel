// src/features/products/comments/services/resolveAvatarUrl.server.ts
'use server';
import 'server-only';

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const AVATARS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET || 'avatars';

export async function resolveAvatarUrl(raw?: string | null): Promise<string | null> {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;

  // 0) Yanlışlıkla tırnaklı kaydedilmişse sök
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }

  // 1) Mutlak http(s) ise dokunma
  if (/^https?:\/\//i.test(s)) return s;

  // 2) Yapıştırılmış public/sign URL gövdelerini ve baştaki /'ları temizle
  s = s.replace(/^\/+/, '');
  s = s.replace(/^storage\/v1\/object\/(public|sign)\//, '');
  s = s.replace(/^[^/]+\.supabase\.co\/storage\/v1\/object\/(public|sign)\//, '');

  // 3) Bucket adı tekrarlarını teke indir (ör. avatars/avatars/... → avatars/...)
  const bucketRe = new RegExp(`^(${AVATARS_BUCKET.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}/)+`);
  s = s.replace(bucketRe, `${AVATARS_BUCKET}/`);

  // 4) Eğer s zaten "avatars/" ile başlıyorsa klasörlü key’dir; STRIP ETME.
  //    Aksi takdirde bucket prefix ekle.
  const key = s.startsWith(`${AVATARS_BUCKET}/`) ? s : `${AVATARS_BUCKET}/${s}`;

  return `${BASE}/storage/v1/object/public/${key}`;
}
