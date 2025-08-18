// RequestsDataGrid.tsx — stateless (tercih edilen)
'use client';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { getRequestsColumns } from '@/constants/requests/columns';
import type { RequestRowUnion } from '@/types/requests';

export default function RequestsDataGrid({ rows }: { rows: RequestRowUnion[] }) {
  const router = useRouter();
  const handleView = (id: string) => router.push(`/requests/${id}`);

  return (
    <DataGrid
      rows={rows}
      columns={getRequestsColumns(handleView) as GridColDef[]}
      getRowId={(r) => r.id}
      autoHeight
      disableRowSelectionOnClick
      hideFooter
    />
  );
}
