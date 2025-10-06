// src/features/requests/components/id/MaterialListCard.tsx
import * as React from 'react';

import MaterialTable from '@/features/requests/components/id/TableGrid.client';

import type { MaterialRow } from '@/features/requests/types';

type Props = { rows: MaterialRow[] };

export default function MaterialListCard({ rows }: Props) {
  return (
    <MaterialTable rows={rows} />
  );
}
