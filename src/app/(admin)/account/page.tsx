'use client';
import React from "react";

import { Box, Paper } from "@mui/material";

import { SnackbarProvider } from "@/hooks/useSnackbar";

import { useAccount } from "@/features/account/useAccount";
import ProfileHeader from "@/features/account/ProfileHeader";
import AccountForm from "@/features/account/AccountForm"; // ayırdığın form component'i
import PasswordForm from "@/features/account/PasswordForm"; // ayrı component
import { getRoleInfo } from "@/features/account/helpers";

import AccountSkeleton from "@/components/skeletons/AccountCard";

export default function AccountPageWrapper() {
  return (
    <SnackbarProvider>
      <AccountPageClient />
    </SnackbarProvider>
  );
}

function AccountPageClient() {
  const { userData, uploading, uploadAvatar, removeAvatar, changeEmail, setUserData } = useAccount();

  if (!userData) return <AccountSkeleton />

  // roleLabel & style extraction
  const { label: roleLabel, sx: roleStyle } = getRoleInfo(userData.role);

  return (
    <Box >
      <Paper sx={{ maxWidth: 1200, mx: 'auto', p: 3, borderRadius: 7 }}>
        
        <ProfileHeader
          userData={userData}
          onUploadClick={(f) => uploadAvatar(f)}
          onRemove={removeAvatar}
          uploading={uploading}
          roleLabel={roleLabel}
          roleStyle={roleStyle}
        />

        <AccountForm 
          userData={userData} 
          setUserData={setUserData} 
          onEmailChange={changeEmail} 
        />
        
        <PasswordForm />
      </Paper>
    </Box>
  );
}
