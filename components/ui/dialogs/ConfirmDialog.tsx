'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Onayla',
  description = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          p: 1,
          borderRadius: 5,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" sx={{ color: 'orangered', borderRadius: 7, textTransform: 'capitalize' }} >
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{ color: 'white', backgroundColor: 'green', borderRadius: 7, textTransform: 'capitalize' }} >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
