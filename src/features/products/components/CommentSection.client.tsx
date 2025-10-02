// src/features/products/components/CommentSection.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

import CommentForm from '@/features/products/comments/components/CommentForm.client';
import CommentList from '@/features/products/comments/components/CommentList.client';
import type { CommentItem } from '@/features/products/comments/types';

import {
  addCommentAction,
  deleteCommentAction,
  updateCommentAction,
  setCommentVote,
  setPinnedCommentAction, // ← EKLENDİ
} from '@/features/products/comments/actions';

type Props = {
  productId: string;
  currentUserId: string | null;
  currentUserUsername: string | null;
  currentUserEmail: string | null;
  currentUserAvatarUrl: string | null;
  initialComments: CommentItem[];
  canPin?: boolean; // ← Admin ise true
};

const MAX_LEN = 2000;

function sortPinnedTop(list: CommentItem[], pinnedId: number | null): CommentItem[] {
  const copy = [...list];
  copy.sort((a, b) => {
    const ap = a.id === pinnedId;
    const bp = b.id === pinnedId;
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    return 0;
  });
  return copy.map(c => ({ ...c, is_pinned: c.id === pinnedId }));
}

export default function CommentSection({
  productId,
  currentUserId,
  currentUserUsername,
  currentUserEmail,
  currentUserAvatarUrl,
  initialComments,
  canPin = false,
}: Props) {
  const router = useRouter();

  const initialPinnedId = initialComments.find(c => c.is_pinned)?.id ?? null;
  const [pinnedId, setPinnedId] = React.useState<number | null>(initialPinnedId);
  const [comments, setComments] = React.useState<CommentItem[]>(sortPinnedTop(initialComments, initialPinnedId));

  async function handleUpdate(commentId: number, content: string) {
    const prev = comments;
    const nowIso = new Date().toISOString();
    setComments(list => list.map(c => (c.id === commentId ? { ...c, content, updated_at: nowIso } : c)));
    try {
      await updateCommentAction({ productId, commentId, content });
    } catch {
      setComments(prev);
    } finally {
      router.refresh();
    }
  }

  async function handleSubmit(content: string) {
    const optimistic: CommentItem | null =
      currentUserId !== null
        ? {
            id: -Math.floor(Math.random() * 1_000_000_000),
            product_id: Number(productId),
            author_id: currentUserId,
            author_name: currentUserUsername || currentUserEmail || 'Kullanıcı',
            author_username: currentUserUsername,
            author_email: currentUserEmail ?? undefined,
            author_avatar_url: currentUserAvatarUrl ?? null,
            content,
            created_at: new Date().toISOString(),
            like_count: 0,
            dislike_count: 0,
            my_vote: 0,
            is_pinned: false,
          }
        : null;

    if (optimistic) setComments(prev => sortPinnedTop([optimistic, ...prev], pinnedId));

    try {
      await addCommentAction({ productId, content });
    } catch {
      if (optimistic) setComments(prev => prev.filter(c => c.id !== optimistic.id));
    } finally {
      router.refresh();
    }
  }

  async function handleDelete(commentId: number) {
    const prev = comments;
    const nextPinned = pinnedId === commentId ? null : pinnedId;
    setComments(p => sortPinnedTop(p.filter(c => c.id !== commentId), nextPinned));
    setPinnedId(nextPinned);
    try {
      await deleteCommentAction({ productId, commentId });
    } catch {
      setComments(prev);
      setPinnedId(pinnedId);
    } finally {
      router.refresh();
    }
  }

  const handleVote = React.useCallback(async (commentId: number, value: -1 | 0 | 1) => {
    await setCommentVote({ productId, commentId, value });
  }, [productId]);

  const handleTogglePin = React.useCallback(async (commentId: number) => {
    const next = pinnedId === commentId ? null : commentId;
    const prevPinned = pinnedId;

    setPinnedId(next);
    setComments(prev => sortPinnedTop(prev, next));

    try {
      await setPinnedCommentAction({ productId, commentId: next });
    } catch {
      // geri al
      setPinnedId(prevPinned);
      setComments(prev => sortPinnedTop(prev, prevPinned));
    }
  }, [productId, pinnedId]);

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default' }}>
      <Paper variant="outlined" elevation={0} sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.1 }}>
              Yorumlar
            </Typography>
            <Chip size="small" variant="outlined" label={`${comments.length}`} sx={{ fontWeight: 600 }} aria-label="Yorum sayısı" />
          </Box>

          <CommentForm
            disabled={false}
            currentUserId={currentUserId}
            onSubmitContent={handleSubmit}
            maxLen={MAX_LEN}
          />

          <Divider />

          <CommentList
            comments={comments}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onVote={handleVote}
            canPin={canPin}
            pinnedId={pinnedId}
            onTogglePin={handleTogglePin}
          />
        </Stack>
      </Paper>
    </Paper>
  );
}
