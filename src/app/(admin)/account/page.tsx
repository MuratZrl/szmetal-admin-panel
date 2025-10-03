// app/(admin)/account/page.tsx
import { redirect } from 'next/navigation';
import { Box } from '@mui/material';
import AccountClientSection from '@/features/account/components/AccountClientSection.client';
import { getAccountData } from '@/features/account/services/getAccountData.server';

export const dynamic = 'force-dynamic'; // veya: export const revalidate = 0;

export default async function AccountPage() {
  const { user, profile } = await getAccountData();

  // Oturum yoksa login'e
  if (!user) {
    redirect('/login?redirectedFrom=%2Faccount');
  }

  // Kullanıcı var ama profil satırı yoksa: cookie'leri route'ta temizleyip login'e
  if (!profile) {
    redirect('/api/logout?redirect=/login');
  }

  return (
    <Box >
      <AccountClientSection initialUserData={profile} />
    </Box>
  );
}
