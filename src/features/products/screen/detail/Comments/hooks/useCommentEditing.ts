'use client';
// src/features/products/screen/detail/Comments/hooks/useCommentEditing.ts

import * as React from 'react';

const DEFAULT_MAX_LEN = 2000;

export type UseCommentEditingParams = {
  maxLen?: number;
  onUpdate: (commentId: number, content: string) => Promise<void> | void;
};

export type UseCommentEditingResult = {
  editingId: number | null;
  draft: string;
  saving: boolean;

  isEditing: (commentId: number) => boolean;

  startEdit: (commentId: number, initial: string) => void;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  cancelEdit: () => void;

  canSave: boolean;
  saveEdit: (commentId: number) => Promise<void>;
};

export function useCommentEditing({
  maxLen = DEFAULT_MAX_LEN,
  onUpdate,
}: UseCommentEditingParams): UseCommentEditingResult {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<string>('');
  const [saving, setSaving] = React.useState<boolean>(false);

  const isEditing = React.useCallback((commentId: number) => editingId === commentId, [editingId]);

  const startEdit = React.useCallback((commentId: number, initial: string) => {
    setEditingId(commentId);
    setDraft(initial ?? '');
  }, []);

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setDraft('');
  }, []);

  const trimmed = draft.trim();
  const canSave = Boolean(
    editingId !== null && !saving && trimmed.length > 0 && trimmed.length <= maxLen,
  );

  const saveEdit = React.useCallback(
    async (commentId: number) => {
      const content = draft.trim();
      if (content.length < 1 || content.length > maxLen) return;

      setSaving(true);
      try {
        await onUpdate(commentId, content);
        setEditingId(null);
        setDraft('');
      } finally {
        setSaving(false);
      }
    },
    [draft, maxLen, onUpdate],
  );

  return {
    editingId,
    draft,
    saving,
    isEditing,
    startEdit,
    setDraft,
    cancelEdit,
    canSave,
    saveEdit,
  };
}
