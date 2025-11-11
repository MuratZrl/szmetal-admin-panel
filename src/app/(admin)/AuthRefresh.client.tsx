// app/(admin)/AuthRefresh.client.tsx
'use client';
import { useBackAuthGuard } from "@/lib/supabase/ui/useBackAuthGuard.client";

type Props = { enabled?: boolean };

export default function AuthRefresh({ enabled = true }: Props): null {
  // Prod dışı susturmak için dışarıdan kontrol veriyoruz
  useBackAuthGuard({ enabled });
  return null;
}
