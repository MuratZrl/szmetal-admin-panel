'use client';
// src/features/products/screen/detail/Comments/hooks/useCommentDeletingConfirm.ts

import * as React from 'react';

export type UseCommentDeleteConfirmParams = {
  onDelete: (commentId: number) => Promise<void> | void;
};

export type UseCommentDeleteConfirmResult = {
  confirmDeleteId: number | null;
  deleting: boolean;
  requestDelete: (commentId: number) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
};

export function useCommentDeleteConfirm(
  params: UseCommentDeleteConfirmParams
): UseCommentDeleteConfirmResult {
  const { onDelete } = params;

  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const requestDelete = React.useCallback((commentId: number) => {
    setConfirmDeleteId(commentId);
  }, []);

  const closeDelete = React.useCallback(() => {
    if (deleting) return;
    setConfirmDeleteId(null);
  }, [deleting]);

  const confirmDelete = React.useCallback(async () => {
    const id = confirmDeleteId;
    if (id === null) return;

    setDeleting(true);
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }, [confirmDeleteId, onDelete]);

  return {
    confirmDeleteId,
    deleting,
    requestDelete,
    closeDelete,
    confirmDelete,
  };
}
