// src/features/account/AccountForm.tsx
"use client";

import React, { useEffect } from "react";
import { Box, Grid, TextField, Button, FormControl, MenuItem, Typography } from "@mui/material";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Asserts } from "yup";
import { accountSchema } from "@/constants/form-validations/accountSchemas";
import { commonTextFieldProps } from "@/constants/formstyles";
import { countries } from "@/constants/data/countries";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { UserData } from "./useAccount";

// FormValues tipi şemadan otomatik türetilir — böylece any yok.
type FormValues = Asserts<typeof accountSchema>;

export default function AccountForm({
  userData,
  setUserData,
  onEmailChange,
}: {
  userData: UserData;
  setUserData: (u: UserData) => void;
  onEmailChange?: (email: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(accountSchema) as unknown as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: {
      username: userData?.username ?? "",
      phone: userData?.phone ?? "",
      company: userData?.company ?? "",
      country: userData?.country ?? "",
    },
  });

  // Sync userData -> form (reset)
  useEffect(() => {
    reset({
      username: userData?.username ?? "",
      phone: userData?.phone ?? "",
      company: userData?.company ?? "",
      country: userData?.country ?? "",
    });
  }, [userData, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Oturum bulunamadı");

      const { error } = await supabase
        .from("users")
        .update({
          username: data.username,
          phone: data.phone || null,
          company: data.company || null,
          country: data.country || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Local state update
      setUserData({
        ...userData,
        username: data.username,
        phone: data.phone ?? null,
        company: data.company ?? null,
        country: data.country ?? null,
      });
    } catch (err: unknown) {
      // Hata gösterimini merkezi snackbar ile yap; burada fallback console
      console.error("Account update error", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Typography fontSize={14} fontWeight={600} pb={2} gutterBottom>
        Kişisel Bilgiler
      </Typography>

      <Grid container spacing={2} >
        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            required
            fullWidth
            label="Kullanıcı Adı"
            {...register("username")}
            helperText={errors.username?.message}
            error={!!errors.username}
            InputLabelProps={{ shrink: true }}
            {...commonTextFieldProps}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              required
              fullWidth
              label="E-Posta"
              value={userData?.email ?? ""}
              disabled
              {...commonTextFieldProps}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => onEmailChange?.(userData.email ?? "")}
              sx={{ px: 2, textTransform: "capitalize", backgroundColor: "orangered" }}
            >
              Email Değiştir
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            fullWidth
            label="Telefon"
            {...register("phone")}
            helperText={errors.phone?.message}
            error={!!errors.phone}
            inputProps={{ maxLength: 11 }}
            {...commonTextFieldProps}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <TextField
            fullWidth
            label="Şirket"
            {...register("company")}
            helperText={errors.company?.message}
            error={!!errors.company}
            {...commonTextFieldProps}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} >
          <FormControl fullWidth> 
            <TextField
              select
              label="Ülke Seçimi"
              value={watch("country") || ""}
              {...register("country")}
              {...commonTextFieldProps}
            >
              <MenuItem value="">
                <em>Ülke Seçimi</em>
              </MenuItem>
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="flex-end" >
        <Button
          type="submit"
          variant="contained"
          disabled={!isDirty || !isValid}
          sx={{ px: 3.25, py: 1, backgroundColor: "orangered", borderRadius: 2 }}
        >
          Kaydet
        </Button>
      </Box>
    </Box>
  );
}
