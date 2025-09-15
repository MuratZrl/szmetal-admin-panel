// src/features/dashboard/services/dashboard.server.ts
import { fetchDashboardCharts } from './chart.server';
import { fetchRequestsBySystemGroup3M } from './subchart.server';
import { fetchRequestsStatusPieAllTime } from './subchart2.server';
import { fetchRequestsByCountryGroup3M } from './subchart3.server';

export async function fetchAllDashboardData() {
  const [charts, systems3m, countries3m, statusPie] = await Promise.all([
    fetchDashboardCharts(),
    fetchRequestsByCountryGroup3M({ topK: 6 }),
    fetchRequestsBySystemGroup3M({ topK: 5 }),
    fetchRequestsStatusPieAllTime(),
  ]);
  return { charts, systems3m, countries3m, statusPie };
}
