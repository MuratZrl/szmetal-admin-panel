'use client';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, TextField, Box } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

import { TextFieldProps } from '@mui/material';

type ChangeEmailDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (newEmail: string) => void;
  newEmail: string;
  setNewEmail: (value: string) => void;
  commonTextFieldProps?: Partial<TextFieldProps>; // isteğe bağlı, dışarıdan gelen input stilleri
};

const ChangeEmailDialog = ({
  open,
  onClose,
  onSubmit,
  newEmail,
  setNewEmail,
  commonTextFieldProps = {},
}: ChangeEmailDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          p: 2,
          borderRadius: 5,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LockIcon />
          <Typography variant="h6" component="span">
            E-Posta Değiştir
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Yeni E-Posta"
          type="email"
          fullWidth
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          {...commonTextFieldProps}
        />

        <Typography variant="body2" color="text.secondary" mt={2}>
          Yeni e-posta adresinize doğrulama linki gönderilecektir. Lütfen gelen kutunuzu kontrol edin.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'orangered', textTransform: 'capitalize' }}>
          İptal
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onSubmit(newEmail);
          }}
          sx={{ backgroundColor: 'orangered', borderRadius: 7, textTransform: 'capitalize' }}
        >
          Link Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeEmailDialog;
