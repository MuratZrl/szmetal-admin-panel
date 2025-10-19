// src/components/ui/dialogs/ConfirmDialog.tsx
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type ButtonProps,
  type DialogProps,
} from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  /** Onay butonu metni; dinamik metin verebilirsin (örn. "Kapatılıyor...") */
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;

  /** İçeriği genişletmek için slot. Form alanlarını buraya koy. */
  children?: React.ReactNode;

  /** Onay butonunu devre dışı bırak */
  confirmDisabled?: boolean;

  /** Renk özelleştirmeleri */
  confirmColor?: ButtonProps['color'];
  cancelColor?: ButtonProps['color'];

  /** Kapatmayı kilitle (escape/backdrop) — işlem sırasında iyi olur */
  disableClose?: boolean;

  /** Dialog boyutları; istersen override edebil */
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
} & Omit<DialogProps, 'open' | 'onClose' | 'maxWidth' | 'fullWidth'>;

export default function ConfirmDialog({
  open,
  title = 'Onayla',
  description = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onClose,
  onConfirm,
  children,
  confirmDisabled = false,
  confirmColor = 'primary',
  cancelColor = 'inherit',
  disableClose = false,
  maxWidth = 'sm',
  fullWidth = true,
  ...rest
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (disableClose) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={disableClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      PaperProps={{
        sx: { p: 1.25, borderRadius: 5 },
      }}
      {...rest}
    >
      {!!title && <DialogTitle>{title}</DialogTitle>}

      <DialogContent>
        {!!description && (
          <DialogContentText sx={{ mb: children ? 2 : 0 }}>
            {description}
          </DialogContentText>
        )}

        {/* Ek içerik (form, grid, açıklama vs.) */}
        {children}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          color={cancelColor}
          disabled={disableClose}
          sx={{ borderRadius: 7, textTransform: 'capitalize', px: 2 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={confirmDisabled || disableClose}
          sx={{ color: 'white', borderRadius: 7, textTransform: 'capitalize' }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
