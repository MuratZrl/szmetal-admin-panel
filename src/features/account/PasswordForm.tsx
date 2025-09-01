// src/features/account/PasswordForm.tsx
"use client";

import React from "react";
import { useState } from "react";

import { Box, Grid, TextField, Button, InputAdornment, IconButton, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useForm, type Resolver } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import type { Asserts } from "yup";

import { passwordSchema } from "@/constants/form-validations/passwordSchemas";

import { useSnackbar } from "@/components/ui/snackbar/useSnackbar.client";

import { supabase } from "@/lib/supabase/supabaseClient";


type PasswordFormValues = Asserts<typeof passwordSchema>;

export default function PasswordForm() {
  const { show } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: yupResolver(passwordSchema) as unknown as Resolver<PasswordFormValues>,
    mode: "onChange",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const onSubmit = async (data: PasswordFormValues) => {
    const { currentPassword, newPassword } = data;

    try {
      // 1) oturumdan e-posta al
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        show("Oturum bulunamadı. Lütfen tekrar giriş yapın.", "error");
        return;
      }

      // 2) mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword ?? "",
      });

      if (signInError) {
        // Kullanıcıya dost mesaj — teknik hata mesajını doğrudan gösterme
        show("Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.", "error");
        return;
      }

      // 3) yeni şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword ?? "",
      });

      if (updateError) {
        // error.message'e bakıp daha anlamlı mesaj ver
        const msg = updateError.message ?? "";
        if (msg.includes("Password should contain") || msg.includes("contains")) {
          show("Yeni şifre: en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir.", "error");
        } else if (msg.includes("minimum") || msg.includes("minimum length")) {
          show("Yeni şifre çok kısa. Daha güçlü bir şifre deneyin.", "error");
        } else {
          show("Şifre güncellenemedi. Lütfen tekrar deneyin.", "error");
        }
        return;
      }

      // Başarılı
      show("Şifreniz başarıyla güncellendi.", "success");
      reset();
    } catch (err) {
      console.error("Şifre değiştirme hatası:", err);
      show("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.", "error");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography fontSize={14} fontWeight={600} py={2} gutterBottom>
        Şifreyi Güncelle
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }} >
            <TextField
              fullWidth
              type={showCurrent ? "text" : "password"}
              label="Mevcut Şifre"
              {...register("currentPassword" as const)}
              helperText={errors.currentPassword?.message as string | undefined}
              error={!!errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent((s) => !s)} edge="end" aria-label="toggle current password visibility">
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} >
            <TextField
              fullWidth
              type={showNew ? "text" : "password"}
              label="Yeni Şifre"
              {...register("newPassword" as const)}
              helperText={errors.newPassword?.message as string | undefined}
              error={!!errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((s) => !s)} edge="end" aria-label="toggle new password visibility">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="outlined"
            color="secondary"
            disabled={!isDirty || !isValid || isSubmitting}
            sx={{ px: 2, py: 1, color: "orangered", borderColor: "orangered", borderRadius: 2 }}
          >
            {isSubmitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
