'use client';
// app/(admin)/AuthRefresh.client.tsx
import { useBackAuthGuard } from "@/lib/supabase/hooks/useBackAuthGuard.client";

type Props = { enabled?: boolean };

export default function AuthRefresh({ enabled = true }: Props): null {
  // Prod dışı susturmak için dışarıdan kontrol veriyoruz
  useBackAuthGuard({ enabled });
  return null;
}
