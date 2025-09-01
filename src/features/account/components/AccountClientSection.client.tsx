// src/features/account/components/AccountClientSection.client.tsx
"use client";

import { SnackbarProvider } from "@/components/ui/snackbar/useSnackbar.client";
import { useAccount, type UserData } from "@/features/account/hooks/useAccount";
import ProfileHeader from "@/features/account/ProfileHeader";
import AccountForm from "@/features/account/AccountForm";
import PasswordForm from "@/features/account/PasswordForm";
import { getRoleInfo } from "@/features/account/helpers";
import AccountSkeleton from "@/features/account/components/AccountCard.client";

type Props = {
  initialUserData: UserData | null; // ← SADECE BU
};

export default function AccountClientSection({ initialUserData }: Props) {
  return (
    <SnackbarProvider>
      <Inner initialUserData={initialUserData} />
    </SnackbarProvider>
  );
}

function Inner({ initialUserData }: Props) {
  // Hook’a options değil, { initialUserData } geçiriyoruz
  const { userData, uploading, uploadAvatar, removeAvatar, changeEmail, setUserData } =
    useAccount({ initialUserData });

  if (!userData) return <AccountSkeleton />;

  const { label: roleLabel, sx: roleStyle } = getRoleInfo(userData.role);

  return (
    <>
      <ProfileHeader
        userData={userData}
        onUploadClick={(f) => uploadAvatar(f)}
        onRemove={removeAvatar}
        uploading={uploading}
        roleLabel={roleLabel}
        roleStyle={roleStyle}
      />
      <AccountForm userData={userData} setUserData={setUserData} onEmailChange={changeEmail} />
      <PasswordForm />
    </>
  );
}
