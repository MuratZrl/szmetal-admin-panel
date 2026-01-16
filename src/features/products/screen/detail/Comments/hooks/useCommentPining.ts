// src/features/products/screen/detail/Comments/hooks/useCommentPinning.ts
'use client';

import * as React from 'react';

type Params = {
  onTogglePin: (commentId: number) => Promise<void> | void;
};

type Result = {
  pinningId: number | null;
  isPinning: (commentId: number) => boolean;
  togglePin: (commentId: number) => Promise<void>;
};

export function useCommentPinning({ onTogglePin }: Params): Result {
  const [pinningId, setPinningId] = React.useState<number | null>(null);

  const isPinning = React.useCallback(
    (commentId: number) => pinningId === commentId,
    [pinningId],
  );

  const togglePin = React.useCallback(
    async (commentId: number) => {
      if (pinningId !== null) return; // aynı anda iki pin operasyonu yapma
      setPinningId(commentId);
      try {
        await onTogglePin(commentId);
      } finally {
        setPinningId(null);
      }
    },
    [onTogglePin, pinningId],
  );

  return { pinningId, isPinning, togglePin };
}
