'use client';
// src/features/products/screen/detail/Comments/DeleteCommentDialog.client.tsx

import * as React from 'react';
import { Typography } from '@mui/material';

import ConfirmDialog from '@/components/ui/dialogs/ConfirmDialog';

type Props = {
  open: boolean;
  deleting?: boolean;

  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  /** Diyalog içinde göstermek için (ilk 300 karakter) */
  previewText?: string;

  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function DeleteCommentDialog({
  open,
  deleting = false,
  onClose,
  onConfirm,
  previewText,
  title = 'Yorumu sil',
  description = 'Bu yorumu silmek istediğine emin misin? Bu işlem geri alınamaz.',
  confirmText,
  cancelText = 'İptal',
}: Props): React.JSX.Element {
  const finalConfirmText = confirmText ?? (deleting ? 'Siliniyor...' : 'Sil');

  const snippet = (previewText ?? '').slice(0, 300);
  const hasMore = (previewText ?? '').length > 300;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => void onConfirm()}
      title={title}
      description={description}
      confirmText={finalConfirmText}
      cancelText={cancelText}
      confirmColor="error"
      disableClose={deleting}
      confirmDisabled={deleting}
    >
      {open && snippet ? (
        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
          {snippet}
          {hasMore ? '…' : ''}
        </Typography>
      ) : null}
    </ConfirmDialog>
  );
}
