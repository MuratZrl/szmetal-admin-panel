// account/page.tsx

'use client';

import dynamic from 'next/dynamic';
const ProfileSkeleton = dynamic(() => import('../_components_/skeletons/AccountCard'), { ssr: false });

import ChangeEmailDialog from '../_components_/ui/dialogs/ChangeEmailDialog';

import * as yup from 'yup';
import { Asserts } from 'yup';

import { useEffect, useState } from 'react';

import { useForm, Resolver } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import { accountSchema } from '../_constants_/form-validations/accountSchemas';
import { passwordSchema } from '../_constants_/form-validations/passwordSchemas';

import {
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  MenuItem,
  Typography,
  Divider,
  Paper,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { commonTextFieldProps } from '../_constants_/formstyles';

import { supabase } from '../../lib/supabase/supabaseClient';

// **********************************************************************************************************************

type UserData = {
  image: string | null;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  company: string | null;
};

export default function AccountPage() {

  const [userData, setUserData] = useState<UserData | null>(null);
  const [uploading, setUploading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  type FormValues = Asserts<typeof accountSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<FormValues>({
      resolver: yupResolver(accountSchema) as Resolver<FormValues>, // 👈 daha tip güvenli cast
      mode: 'onChange',
    });


  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: {
      errors: passwordErrors,
      isDirty: isPasswordDirty,
      isValid: isPasswordValid,
    },
    reset: resetPasswordForm,
  } = useForm<yup.InferType<typeof passwordSchema>>({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });


  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'Admin':
        return {
          background: 'linear-gradient(90deg, purple, orangered)',
          color: 'white',
          fontWeight: 'bold',
        };
      case 'Moderator':
        return {
          backgroundColor: 'purple',
          color: 'white',
        };
      default:
        return {
          backgroundColor: 'orangered',
          color: 'white',
        };
    }
  };

  const showSnackbar = (msg: string, type: 'success' | 'error' | 'info') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  // Resim yükleme fonksiyonu
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🔒 Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Sadece JPG, PNG veya WEBP dosyaları yüklenebilir.', 'error');
      return;
    }

    // 🔒 Dosya boyutu kontrolü
    const maxSize = 5 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showSnackbar('Dosya boyutu 5MB\'ı geçemez.', 'error');
        return;
      }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      // ❗️ Snackbar: Yükleme Hatası
      showSnackbar('Resim silinemedi.', 'error');
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl;

    if (publicUrl) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('id', user?.id);

      // ❗️ Snackbar: Yükleme Başarılı
      showSnackbar('Resim başarıyla yüklendi!', 'success');

      setUserData((prev) => prev ? { ...prev, image: publicUrl } : null);
    }

    setUploading(false);
  };

  // Resim kaldırma fonksiyonu
  const handleRemoveImage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('image')
      .eq('id', user.id)
      .single();

    const imageUrl: string | null = userData?.image;
    if (!imageUrl) {
      // ❗️ Snackbar: Zaten yok
      showSnackbar('Kullanıcının resmi yok', 'info');
      return;
    }

    const path = imageUrl.split('/storage/v1/object/public/')[1];

    if (path) {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([path]);

      if (deleteError) {
        // ❗️ Snackbar: Silme Hatası
        showSnackbar('Resim silinemedi.', 'error');
        return;
      }
    }

    await supabase
      .from('users')
      .update({ image: null })
      .eq('id', user.id);

    // ❗️ Snackbar: Silme Başarılı
    showSnackbar('Profil resmi kaldırıldı.', 'success');

    setUserData((prev) => prev ? { ...prev, image: null } : null);
  };

  // Email değiştirme fonksiyonu
  const handleEmailChange = async (email: string) => {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: window.location.origin + '/account' } // daha esnek
    );

    if (error) {
      showSnackbar(`E-posta değiştirilemedi: ${error.message}`, 'error');

    } else {
      showSnackbar('Yeni e-posta adresine doğrulama e-postası gönderildi.', 'info');
    }
  };

  // Şifre değiştirme fonksiyonu
  const handlePasswordChange = async (data: yup.InferType<typeof passwordSchema>) => {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      showSnackbar("Lütfen her iki alanı da doldurun.", "error");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      showSnackbar("Kullanıcı e-postası alınamadı.", "error");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      showSnackbar("Mevcut şifreniz hatalı.", "error");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      const msg = updateError.message;

      let userFriendlyMessage = "Şifre güncellenemedi.";

      if (msg.includes('Password should contain')) {
        userFriendlyMessage = "Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.";
      } else if (msg.includes('minimum length')) {
        userFriendlyMessage = "Şifre çok kısa. Daha güçlü bir şifre deneyin.";
      }

      showSnackbar(userFriendlyMessage, "error");
      return;

    } else {
      showSnackbar("Şifreniz başarıyla güncellendi.", "success");
      resetPasswordForm(); // ✅ sadece şifre formunu temizler
    }
  };


  // Form bilgilerini, butona tıklayınca "users" tablosuna kaydetme fonksiyonu (ANCAK! e-mail bilgisi şu an auth.users üzerinden değişiyor.)
  const onSubmit = async (data: FormValues) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showSnackbar("Oturum bulunamadı.", "error");
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: data.username,
        phone: data.phone,
        company: data.company,
      })
      .eq('id', user.id);

    if (updateError) {
      showSnackbar("Bilgiler güncellenemedi!", "error");

    } else {
      showSnackbar("Bilgiler başarıyla güncellendi.", "success");

      // Güncellenen verileri state'e geri yükle
      setUserData((prev) => prev ? { ...prev, ...data } : null);
    }
  };















// **********************************************************************************************************************

  // ******************** useEffect hookları ********************
  useEffect(() => {
    if (userData) {
      reset({
        username: userData.username ?? '',
        phone: userData.phone ?? '',
        company: userData.company ?? '',
      });
    }
  }, [userData, reset]);


  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('Oturum bulunamadı:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('image, username, email, role, phone, company')
        .eq('id', user.id)
        .single();

      if (error) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Kullanıcı bilgileri alınamadı.');
        setSnackbarOpen(true);

      } else {
        setUserData(data);
      }
    };

    fetchUserData();
  }, []);


















// **********************************************************************************************************************

if (!userData) {
  return <ProfileSkeleton />;
}

  return (
    <Box 
      display="flex" 
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between" 
      sx={{ py: 2 }}
    >

        <Paper elevation={1} sx={{ mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, p: 3, borderRadius: 7 }} >

          {/* Profil */}
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={3}>

            {/* Sol: Avatar ve Bilgiler */}
            <Box display="flex" alignItems="center" gap={2}>

              <Avatar
                alt="Kullanıcı Avatarı"
                src={userData?.image || '/avatar.jpg'} // kullanıcıdan gelen URL olabilir
                sx={{ width: 64, height: 64 }}
              />

              <Box>

                <Typography fontWeight={600}>
                  {userData?.username || 'Yükleniyor...'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {userData?.email || ''}
                </Typography>

                <Chip
                  label={userData?.role ?? '...'}
                  size="small"
                  sx={{
                    mt: 1,
                    fontWeight: 'bold',
                    boxShadow: 1,
                    pointerEvents: 'none',
                    ...getRoleColor(userData?.role ?? null), // 👈 renkler ayrı fonksiyonla
                  }}
                />

              </Box>

            </Box>

            {/* Sağ: Fotoğraf Butonları */}
            <Box display="flex" gap={1}>

              <Button
                variant="outlined"
                size="small"
                component="label"
                sx={{ color: 'orangered', textTransform: 'capitalize', borderColor: 'orangered', borderRadius: 7 }}
              >
                {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                />
              </Button>

              <Button
                variant="text"
                size="small"
                color="error"
                sx={{ color: 'red', textTransform: 'capitalize', borderRadius: 7 }}
                onClick={handleRemoveImage}
              >
                Kaldır
              </Button>

            </Box>

          </Box>

          {/* ******************************************************************************** */}

          <Divider sx={{ my: 3 }} />

          {/* ******************************************************************************** */}

          {/* Bilgi Güncelleme */}
          <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom >
            Kişisel Bilgiler
          </Typography>

          <Box component={'form'} onSubmit={handleSubmit(onSubmit)} >

            <Grid container spacing={2}>

              <Grid size={{ xs: 12, sm: 6 }} >
                <TextField
                  required
                  fullWidth
                  label="Kullanıcı Adı"
                  type='text'
                  {...register('username')}
                  helperText={errors.username?.message}
                  error={!!errors.username}
                  InputLabelProps={{ shrink: true }} // ✅ LABEL YUKARI ZORLA
                  {...commonTextFieldProps}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    required
                    fullWidth
                    label="E-Posta"
                    value={userData?.email ?? ''}
                    disabled
                    {...commonTextFieldProps}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setEmailModalOpen(true)}
                    sx={{ p: 1.25, px: 3, textTransform: 'capitalize', borderColor: 'orangered', borderRadius: 4, backgroundColor: 'orangered', textWrap: 'wrap', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    Email Değiştir
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Telefon"
                  {...register('phone')}
                  helperText={errors.phone?.message}
                  error={!!errors.phone}
                  inputProps={{ maxLength: 11 }}
                  {...commonTextFieldProps}
                />
              </Grid>

              <Grid size={{ xs: 12, sm :6 }}>
                <TextField
                  fullWidth
                  label="Şirket"
                  {...register('company')}
                  {...commonTextFieldProps}
                />
              </Grid>

              <FormControl fullWidth >
                <TextField
                  select
                  label="Ülke"
                  {...commonTextFieldProps}
                >
                  <MenuItem value={10}>Türkiye</MenuItem>
                  <MenuItem value={20}>İngiltere</MenuItem>
                  <MenuItem value={30}>Amerika Birleşik Devletleri</MenuItem>
                </TextField>
              </FormControl>

            </Grid>

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                type='submit'
                variant="contained"
                disabled={!isDirty || !isValid} // 👈 Değişiklik yapılmadıysa veya form geçersizse
                sx={{ px: 2, py: 1, backgroundColor: 'orangered', borderRadius: 10, textTransform: 'capitalize' }}
              >
                Kaydet
              </Button>
            </Box>

          </Box>

          <Divider sx={{ my: 3 }} />

          {/* ******************************************************************************** */}

          {/* Şifre */}
          <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom >
            Şifreyi Güncelle
          </Typography>

          <Grid container spacing={2} >

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                label="Mevcut Şifre"

                {...passwordRegister('currentPassword')}
                helperText={passwordErrors.currentPassword?.message}
                error={!!passwordErrors.currentPassword}

                InputProps={{
                  ...commonTextFieldProps.InputProps, // common stilleri al
                  endAdornment: ( // ama buraya özel olarak ikon da ekle
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrentPassword((prev) => !prev)} edge="end">
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}

                InputLabelProps={commonTextFieldProps.InputLabelProps}
                variant={commonTextFieldProps.variant}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                label="Yeni Şifre"

                {...passwordRegister('newPassword')}
                helperText={passwordErrors.newPassword?.message}
                error={!!passwordErrors.newPassword}
                
                InputProps={{
                  ...commonTextFieldProps.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword((prev) => !prev)} edge="end">
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}

                InputLabelProps={commonTextFieldProps.InputLabelProps}
                variant={commonTextFieldProps.variant}
              />
            </Grid>

          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
              type='submit'
              variant="outlined" 
              color="secondary" 
              onClick={handlePasswordSubmit(handlePasswordChange)}
              disabled={!isPasswordDirty || !isPasswordValid}
              sx={{ px: 2, py: 1, color: 'orangered', borderColor: 'orangered', borderRadius: 10, textTransform: 'capitalize' }}>
              Şifreyi Güncelle
            </Button>
          </Box>

        </Paper>

      <ChangeEmailDialog
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSubmit={handleEmailChange}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        commonTextFieldProps={commonTextFieldProps}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
    </Box>
  );
}
