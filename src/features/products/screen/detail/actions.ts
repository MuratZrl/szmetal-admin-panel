// src/features/products/comments/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { Database } from '@/types/supabase';

/* -------------------------------------------------------------------------- */
/* Tablo adları                                                                */
/* -------------------------------------------------------------------------- */

const TABLE = 'product_comments' as const;
const VOTE_TABLE = 'product_comment_votes' as const;
const PIN_TABLE = 'product_comment_pins' as const;

/* -------------------------------------------------------------------------- */
/* Tipler                                                                      */
/* -------------------------------------------------------------------------- */

type RowInsert = Database['public']['Tables'][typeof TABLE]['Insert'];
type RowUpdate = Database['public']['Tables'][typeof TABLE]['Update'];
type VoteInsert = Database['public']['Tables'][typeof VOTE_TABLE]['Insert'];
type PinInsert = Database['public']['Tables'][typeof PIN_TABLE]['Insert'];

export type AddCommentInput = {
  productId: string;   // ürün UUID
  content: string;
};

export type DeleteCommentInput = {
  productId: string;   // ürün UUID
  commentId: number;
};

export type UpdateCommentInput = {
  productId: string;   // ürün UUID
  commentId: number;
  content: string;
};

export type VoteValue = -1 | 0 | 1;

export type SetVoteInput = {
  productId: string;   // path revalidate için (UUID)
  commentId: number;
  value: VoteValue;    // 1: like, -1: dislike, 0: kaldır
};

export type SetPinnedCommentInput = {
  productId: string;        // ürün UUID
  commentId: number | null; // null => sabitlemeyi kaldır
};

const MAX_LEN = 2000;

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                 */
/* -------------------------------------------------------------------------- */

function asInsert(v: RowInsert) { return v as unknown as never; }
function asUpdate(v: RowUpdate) { return v as unknown as never; }
function asVoteInsert(v: VoteInsert) { return v as unknown as never; }
function asPinInsert(v: PinInsert) { return v as unknown as never; }

function ensureProductUuid(id: string): string {
  const trimmed = id?.trim();
  if (!trimmed) {
    throw new Error('Geçersiz ürün kimliği.');
  }
  return trimmed;
}

function validateContent(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_LEN) {
    throw new Error(`Yorum 1–${MAX_LEN} karakter olmalı.`);
  }
  return trimmed;
}

/** KANONİK ürün yolu: /products/{uuid} */
async function canonicalProductPath(
  _sb: Awaited<ReturnType<typeof createSupabaseRouteClient>>,
  productUuid: string,
) {
  return `/products/${encodeURIComponent(productUuid)}`;
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                     */
/* -------------------------------------------------------------------------- */

export async function addCommentAction(input: AddCommentInput): Promise<void> {
  const sb = await createSupabaseRouteClient();

  const productUuid = ensureProductUuid(input.productId);
  const content = validateContent(input.content);

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error('Giriş yapmalısınız.');

  const row: RowInsert = {
    product_uuid: productUuid,          // yeni kolon
    // product_id: null,                // legacy; istersen hiç göndermeyebilirsin
    author_id: user.id,
    author_name: user.email ?? 'Kullanıcı',
    content,
  };

  const { error } = await sb.from(TABLE).insert(asInsert(row));
  if (error) throw new Error('Yorum kaydedilemedi.');

  revalidatePath(await canonicalProductPath(sb, productUuid));
}

export async function deleteCommentAction(input: DeleteCommentInput): Promise<void> {
  const sb = await createSupabaseRouteClient();

  const productUuid = ensureProductUuid(input.productId);

  const { error } = await sb
    .from(TABLE)
    .delete()
    .eq('id', input.commentId)
    .eq('product_uuid', productUuid);   // uuid üzerinden filtre

  if (error) throw new Error('Yorum silinemedi.');

  revalidatePath(await canonicalProductPath(sb, productUuid));
}

export async function updateCommentAction(input: UpdateCommentInput): Promise<void> {
  const sb = await createSupabaseRouteClient();

  const productUuid = ensureProductUuid(input.productId);
  const content = validateContent(input.content);

  const patch: RowUpdate = { content };

  const { error } = await sb
    .from(TABLE)
    .update(asUpdate(patch))
    .eq('id', input.commentId)
    .eq('product_uuid', productUuid);   // yine uuid

  if (error) throw new Error('Yorum güncellenemedi.');

  revalidatePath(await canonicalProductPath(sb, productUuid));
}

export async function setCommentVote(input: SetVoteInput): Promise<void> {
  const { productId, commentId, value } = input;
  const productUuid = ensureProductUuid(productId);

  const sb = await createSupabaseRouteClient();

  const { data: userRes, error: authErr } = await sb.auth.getUser();
  if (authErr || !userRes?.user) {
    throw new Error('Unauthorized');
  }
  const userId = userRes.user.id;

  if (value === 0) {
    const { error } = await sb
      .from(VOTE_TABLE)
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) throw new Error('Oy kaldırılamadı.');
  } else {
    const row: VoteInsert = {
      comment_id: commentId,
      user_id: userId,
      value,
    };
    const { error } = await sb
      .from(VOTE_TABLE)
      .upsert(asVoteInsert(row), { onConflict: 'comment_id,user_id' });
    if (error) throw new Error('Oy güncellenemedi.');
  }

  revalidatePath(await canonicalProductPath(sb, productUuid));
}

export async function setPinnedCommentAction(input: SetPinnedCommentInput): Promise<void> {
  const sb = await createSupabaseRouteClient();

  const productUuid = ensureProductUuid(input.productId);

  const { data: userRes } = await sb.auth.getUser();
  const uid = userRes?.user?.id ?? null;
  if (!uid) throw new Error('Giriş yapmalısınız.');

  if (input.commentId === null) {
    const { error } = await sb
      .from(PIN_TABLE)
      .delete()
      .eq('product_uuid', productUuid);   // uuid’e göre sil
    if (error) throw new Error('Sabit yorum kaldırılamadı.');
    revalidatePath(await canonicalProductPath(sb, productUuid));
    return;
  }

  const { count, error: chkErr } = await sb
    .from(TABLE)
    .select('id', { head: true, count: 'exact' })
    .eq('id', input.commentId)
    .eq('product_uuid', productUuid);

  if (chkErr) throw new Error('Yorum doğrulanamadı.');
  if (!count || count < 1) throw new Error('Yorum bu ürüne ait değil.');

  const pinRow: PinInsert = {
    product_uuid: productUuid,
    // product_id: null,                 // legacy alan, istersen doldurmazsın
    comment_id: input.commentId,
    pinned_by: uid,
  };

  const { error } = await sb
    .from(PIN_TABLE)
    .upsert(asPinInsert(pinRow), { onConflict: 'product_uuid' });

  if (error) throw new Error('Yorum sabitlenemedi.');

  revalidatePath(await canonicalProductPath(sb, productUuid));
}
