// app/(admin)/requests/page.tsx
import RequestStats from '@/components/ui/requests/RequestsStats'; // client
import RequestsDataGrid from '@/components/ui/requests/RequestsDataGrid';
import RequestsCharts from '@/components/ui/requests/RequestsCharts';
import { fetchAllRequests } from '@/services/requests.server';

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
