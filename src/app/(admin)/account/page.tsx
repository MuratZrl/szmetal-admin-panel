// app/(admin)/account/page.tsx
import { redirect } from 'next/navigation';
import { Box, Paper } from '@mui/material';
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
    <Box px={1} py={2}>
      <Paper sx={{ maxWidth: 1200, mx: 'auto', borderRadius: 7, p: 2 }}>
        <AccountClientSection initialUserData={profile} />
      </Paper>
    </Box>
  );
}
