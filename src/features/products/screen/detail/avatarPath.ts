// src/features/products/comments/avatarPath.ts
export function normalizeAvatarPath(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = String(input).trim();
  if (!s) return null;

  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (/^https?:\/\//i.test(s)) return s;

  s = s.replace(/^\/+/, '');
  s = s.replace(/^storage\/v1\/object\/public\//, '');
  s = s.replace(/^[^/]+\.supabase\.co\/storage\/v1\/object\/public\//, '');

  const BUCKET = 'avatars';
  if (s.startsWith(`${BUCKET}/`)) {
    let rest = s.slice(BUCKET.length + 1);
    while (rest.startsWith(`${BUCKET}/`)) rest = rest.slice(BUCKET.length + 1);
    return `${BUCKET}/${rest}`;
  }
  return `${BUCKET}/${s}`;
}
