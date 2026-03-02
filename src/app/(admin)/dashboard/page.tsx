// app/(admin)/dashboard/page.tsx
import { Box } from '@mui/material';
import { requirePageAccess } from '@/lib/supabase/auth/guards.server';
import { fetchDashboardDataForRange } from '@/features/dashboard/services/dashboardchart.server';
import { fetchRecentActivity } from '@/features/dashboard/services/activityFeed.server';
import { getDateRangeConfig } from '@/features/dashboard/utils/dateRanges';

import DashboardHeader from '@/features/dashboard/components/DashboardHeaderSection';
import DashboardContent from '@/features/dashboard/components/DashboardContent.client';
import ActivityFeedSection from '@/features/dashboard/components/ActivityFeedSection';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requirePageAccess('/dashboard');

  const config = getDateRangeConfig('thisMonth');

  const [initialData, activityFeed] = await Promise.all([
    fetchDashboardDataForRange(config),
    fetchRecentActivity(15),
  ]);

  return (
    <Box px={1} pt={2} pb={0}>
      <DashboardContent
        headerSlot={<DashboardHeader />}
        activitySlot={<ActivityFeedSection items={activityFeed} />}
        initialData={initialData}
        initialRange="thisMonth"
      />
    </Box>
  );
}
