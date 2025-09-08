// app/(admin)/requests/[id]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { updateRequestStatus } from '@/features/requests/services/requests_id.server';
import type { RequestStatus } from '@/features/requests/services/requests_id.server';

export async function updateRequestStatusAction(input: { id: string; status: RequestStatus }) {
  await updateRequestStatus(input.id, input.status);
  // Sayfayı tazele, cache’i boz
  revalidatePath(`/requests/${input.id}`);
}
