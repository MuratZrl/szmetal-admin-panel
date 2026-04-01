// src/features/products/screen/detail/services/fetchComments.server.ts
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

  // productId artık UUID string
  const pid = productId.trim();

  // 1) Comments + pin + auth — all in parallel
  const [commentsRes, pinRes, userRes] = await Promise.all([
    sb
      .from('product_comments')
      .select('id, product_uuid, author_id, author_name, content, created_at, updated_at')
      .eq('product_uuid', pid)
      .order('created_at', { ascending: false })
      .limit(limit),
    sb
      .from('product_comment_pins')
      .select('comment_id')
      .eq('product_uuid', pid)
      .maybeSingle<PinRow>(),
    sb.auth.getUser(),
  ]);

  const comments = commentsRes.data;
  if (commentsRes.error || !comments || comments.length === 0) {
    return [];
  }

  const pinnedId: number | null = pinRes.data?.comment_id ?? null;
  const me = userRes.data?.user ?? null;

  // 2) Now that we have comment IDs and author IDs, fetch everything else in parallel
  const authorIds = Array.from(new Set(comments.map(c => c.author_id)));
  const ids = comments.map(c => c.id);

  const [usersRes, statsRes, myVotesRes] = await Promise.all([
    sb
      .from('users')
      .select('id, username, image, updated_at')
      .in('id', authorIds),
    sb
      .from('product_comment_vote_stats')
      .select('comment_id, likes, dislikes')
      .in('comment_id', ids),
    me
      ? sb
          .from('product_comment_votes')
          .select('comment_id, value')
          .eq('user_id', me.id)
          .in('comment_id', ids)
      : Promise.resolve({ data: [] as MyVoteRow[], error: null }),
  ]);

  // Build maps
  const userMap = new Map<string, { username: string | null; image: string | null; updated_at: string | null }>();
  for (const u of usersRes.data ?? []) {
    userMap.set(u.id, { username: u.username, image: u.image, updated_at: u.updated_at });
  }

  const statsMap = new Map<number, { likes: number; dislikes: number }>();
  for (const s of (statsRes.data ?? []) as VoteStatsRow[]) {
    statsMap.set(s.comment_id, { likes: s.likes ?? 0, dislikes: s.dislikes ?? 0 });
  }

  const myMap = new Map<number, -1 | 1>();
  for (const v of (myVotesRes.data ?? []) as MyVoteRow[]) {
    myMap.set(v.comment_id, v.value);
  }

  // Resolve all avatar URLs in parallel
  const uniqueAuthors = Array.from(userMap.entries());
  const avatarResults = await Promise.all(
    uniqueAuthors.map(async ([id, u]) => {
      const publicUrl = await resolveAvatarUrl(u.image ?? null);
      const avatarUrl = withVersion(publicUrl, u.updated_at ?? null);
      return [id, avatarUrl] as const;
    })
  );
  const avatarMap = new Map(avatarResults);

  // Enrich
  const enriched: CommentItem[] = comments.map(c => {
    const u = userMap.get(c.author_id);
    const s = statsMap.get(c.id) ?? { likes: 0, dislikes: 0 };
    const mine = (myMap.get(c.id) ?? 0) as -1 | 0 | 1;

    return {
      id: c.id,
      product_id: c.product_uuid,
      author_id: c.author_id,
      author_name: c.author_name,
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at ?? null,
      author_username: u?.username ?? null,
      author_avatar_url: avatarMap.get(c.author_id) ?? null,
      like_count: s.likes,
      dislike_count: s.dislikes,
      my_vote: mine,
      is_pinned: pinnedId === c.id,
    };
  });

  // Pinned comment on top
  enriched.sort((a, b) => {
    const ap = a.is_pinned === true;
    const bp = b.is_pinned === true;
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    return 0;
  });

  return enriched;
}