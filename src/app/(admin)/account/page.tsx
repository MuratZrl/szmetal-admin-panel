// app/(admin)/account/page.tsx
import { Box, Paper } from "@mui/material";
import AccountClientSection from "@/features/account/components/AccountClientSection.client";
import { getAccountData } from "@/features/account/services/getAccountData.server";

// redirect istersen:
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Profil sayfası için genelde güvenli

export default async function AccountPage() {
  const { user, profile } = await getAccountData();

  if (!user) {
    // Login’e postalamak istersen
    redirect("/login?redirectedFrom=%2Faccount");
  }

  return (
    <Box px={1} py={2} >
      <Paper sx={{ maxWidth: 1200, mx: "left", borderRadius: 7 }} >
        {/* Client sınırı burada başlıyor */}
        <AccountClientSection initialUserData={profile} />
      </Paper>  
    </Box>
  );
}
