// src/features/products/screen/detail/Comments/hooks/useCommentVoting.ts
'use client';

import * as React from 'react';
import type { CommentItem } from '@/features/products/screen/detail/Comments/types';

export type VoteValue = -1 | 0 | 1;

export type VoteSnapshot = {
  likes: number;
  dislikes: number;
  mine: VoteValue;
};

export type VoteState = Record<number, VoteSnapshot>;

export type UseCommentVotingParams = {
  comments: CommentItem[];
  currentUserId: string | null;
  onVote: (commentId: number, value: VoteValue) => Promise<void> | void;
};

export type UseCommentVotingResult = {
  canVote: boolean;
  voteState: VoteState;
  votingId: number | null;
  toggleVote: (commentId: number, dir: 1 | -1) => Promise<void>;
  getVote: (commentId: number) => VoteSnapshot;
};

export function useCommentVoting({
  comments,
  currentUserId,
  onVote,
}: UseCommentVotingParams): UseCommentVotingResult {
  const canVote = currentUserId !== null;

  const [voteState, setVoteState] = React.useState<VoteState>({});
  const [votingId, setVotingId] = React.useState<number | null>(null);

  // Yorumlar değiştikçe vote snapshot’ı yeniden kur
  React.useEffect(() => {
    const init: VoteState = Object.fromEntries(
      comments.map((c) => [
        c.id,
        {
          likes: c.like_count ?? 0,
          dislikes: c.dislike_count ?? 0,
          mine: (c.my_vote ?? 0) as VoteValue,
        },
      ]),
    );
    setVoteState(init);
  }, [comments]);

  const applyOptimistic = React.useCallback((id: number, nextMine: VoteValue) => {
    setVoteState((prev) => {
      const cur = prev[id] ?? { likes: 0, dislikes: 0, mine: 0 as VoteValue };

      // eski oyu geri al
      let likes = cur.likes;
      let dislikes = cur.dislikes;
      if (cur.mine === 1) likes = Math.max(0, likes - 1);
      if (cur.mine === -1) dislikes = Math.max(0, dislikes - 1);

      // yeni oyu uygula
      if (nextMine === 1) likes += 1;
      if (nextMine === -1) dislikes += 1;

      return { ...prev, [id]: { likes, dislikes, mine: nextMine } };
    });
  }, []);

  const toggleVote = React.useCallback(
    async (id: number, dir: 1 | -1) => {
      if (!canVote || votingId !== null) return;

      const curMine = voteState[id]?.mine ?? 0;
      const next: VoteValue = curMine === dir ? 0 : dir;

      applyOptimistic(id, next);
      setVotingId(id);

      try {
        await onVote(id, next);
      } catch {
        // geri al
        applyOptimistic(id, curMine);
      } finally {
        setVotingId(null);
      }
    },
    [canVote, votingId, voteState, onVote, applyOptimistic],
  );

  const getVote = React.useCallback(
    (id: number): VoteSnapshot => voteState[id] ?? { likes: 0, dislikes: 0, mine: 0 },
    [voteState],
  );

  return { canVote, voteState, votingId, toggleVote, getVote };
}
