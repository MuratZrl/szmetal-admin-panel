// src/features/products/comments/services/fetchComments.server.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { withVersion } from '@/features/products/utils/url';
import { resolveAvatarUrl } from '@/features/products/screen/detail/services/resolveAvatarUrl.server';
import type { CommentItem } from '@/features/products/screen/detail/Comments/types';

type VoteStatsRow = { comment_id: number; likes: number; dislikes: number };
type MyVoteRow = { comment_id: number; value: -1 | 1 };
type PinRow = { comment_id: number } | null;

export async function fetchProductComments(productId: string, limit = 100): Promise<CommentItem[]> {
  const jar = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: n => jar.get(n)?.value, set() {}, remove() {} } }
  );

  const pid = Number(productId);

  // 1) Yorumlar
  const { data: comments, error } = await sb
    .from('product_comments')
    .select('id, product_id, author_id, author_name, content, created_at, updated_at')
    .eq('product_id', pid)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !comments || comments.length === 0) {
    // Boşsa boş dön; tip şişirmeyelim
    return [];
  }

  // 2) SABİT YORUM (tek satır)
  const { data: pin } = await sb
    .from('product_comment_pins')
    .select('comment_id')
    .eq('product_id', pid)
    .maybeSingle<PinRow>();

  const pinnedId: number | null = pin?.comment_id ?? null;

  // 3) Yazar bilgileri
  const authorIds = Array.from(new Set(comments.map(c => c.author_id)));
  const { data: users } = await sb
    .from('users')
    .select('id, username, image, updated_at')
    .in('id', authorIds);

  const userMap = new Map<string, { username: string | null; image: string | null; updated_at: string | null }>();
  for (const u of users ?? []) {
    userMap.set(u.id, { username: u.username, image: u.image, updated_at: u.updated_at });
  }

  // 4) Oy istatistikleri (like/dislike)
  const ids = comments.map(c => c.id);
  const { data: statsRows } = await sb
    .from('product_comment_vote_stats')
    .select('comment_id, likes, dislikes')
    .in('comment_id', ids);

  const statsMap = new Map<number, { likes: number; dislikes: number }>();
  for (const s of (statsRows ?? []) as VoteStatsRow[]) {
    statsMap.set(s.comment_id, { likes: s.likes ?? 0, dislikes: s.dislikes ?? 0 });
  }

  // 5) Kullanıcının kendi oyu (my_vote)
  const { data: userRes } = await sb.auth.getUser();
  const me = userRes?.user ?? null;

  const myMap = new Map<number, -1 | 1>();
  if (me) {
    const { data: myVotes } = await sb
      .from('product_comment_votes')
      .select('comment_id, value')
      .eq('user_id', me.id)
      .in('comment_id', ids);

    for (const v of (myVotes ?? []) as MyVoteRow[]) {
      myMap.set(v.comment_id, v.value);
    }
  }

  // 6) Zenginleştir
  const enriched: CommentItem[] = [];
  for (const c of comments) {
    const u = userMap.get(c.author_id);
    const publicUrl = await resolveAvatarUrl(u?.image ?? null);
    const avatarUrl = withVersion(publicUrl, u?.updated_at ?? null);

    const s = statsMap.get(c.id) ?? { likes: 0, dislikes: 0 };
    const mine = (myMap.get(c.id) ?? 0) as -1 | 0 | 1;

    enriched.push({
      id: c.id,
      product_id: c.product_id,
      author_id: c.author_id,
      author_name: c.author_name,
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at ?? null,
      author_username: u?.username ?? null,
      author_avatar_url: avatarUrl ?? null,
      like_count: s.likes,
      dislike_count: s.dislikes,
      my_vote: mine,
      is_pinned: pinnedId === c.id, // ← esas mevzu
    });
  }

  // 7) Sabit yorumu en üste al, geri kalan orijinal sırayı koru
  enriched.sort((a, b) => {
    const ap = a.is_pinned === true;
    const bp = b.is_pinned === true;
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    return 0;
  });

  return enriched;
}
