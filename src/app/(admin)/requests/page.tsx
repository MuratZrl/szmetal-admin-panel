// app/(admin)/requests/page.tsx
import RequestStats from '@/features/requests/components/RequestsStats.client'; // client
import RequestsDataGrid from '@/features/requests/components/RequestsDataGrid.client';
import RequestsCharts from '@/features/requests/components/RequestsCharts.client';
import { fetchAllRequests } from '@/features/requests/services/requests.server';

export const revalidate = 60;

export default async function Page() {
  const rows = await fetchAllRequests();
  return (
    <>
      <RequestStats rows={rows} />
      <RequestsDataGrid rows={rows} />
      <RequestsCharts rows={rows} />
    </>
  );
}
