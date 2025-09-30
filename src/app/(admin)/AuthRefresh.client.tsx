// app/(admin)/AuthRefresh.client.tsx
'use client';

import { useBackAuthGuard } from "@/lib/supabase/ui/useBackAuthGuard.client";

export default function AuthRefresh(): null {
  useBackAuthGuard();
  return null;
}
