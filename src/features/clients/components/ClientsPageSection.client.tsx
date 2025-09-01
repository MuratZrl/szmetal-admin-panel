// src/features/clients/components/ClientsPageSection.client.tsx
"use client";

import { Box, Grid, Card, CardHeader, CardContent, Typography } from "@mui/material";

import UsersDataGrid from "@/features/clients/components/UsersDataGrid";
import ClientStats from "@/features/clients/ClientStats";
import MonthlyUserChart from "@/components/ui/charts/MonthlyUserChart";
import GroupedBarChart from "@/components/ui/charts/GroupedUserBarChart";
import { usersTableColumns } from "@/constants/clients/columns";

import { useUsers } from "@/features/clients/hooks/useUsers.client";
import type { ClientUser, UsersTotals } from "../types";

export default function ClientsPageSection({
  initialUsers,
  initialTotals,
}: {
  initialUsers: ClientUser[];
  initialTotals: UsersTotals;
}) {
  const { users, loading, totals } = useUsers({
    initialUsers,
    initialTotals,
  });

  return (
    <Box sx={{ py: { xs: 2, md: 2 } }}>

      <ClientStats totals={totals} />

      <UsersDataGrid rows={users} columns={usersTableColumns} loading={loading} />

      <Grid container spacing={2} mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: 7, height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader title={<Typography variant="h6" fontWeight={600}>Aylık Kullanıcı Artışı</Typography>} />
            <CardContent sx={{ flexGrow: 1 }}>
              <MonthlyUserChart />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ borderRadius: 7, height: "100%", display: "flex", flexDirection: "column" }}>
            <CardHeader title={<Typography variant="h6" fontWeight={600}>Aylara Göre Kullanıcı Statüsü</Typography>} />
            <CardContent sx={{ flexGrow: 1 }}>
              <GroupedBarChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
}
