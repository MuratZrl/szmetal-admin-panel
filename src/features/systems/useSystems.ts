// src/features/systems/useSystems.ts
'use client';

import { useState, useEffect } from 'react';
import type { SystemCardType } from '@/types/systems';
import { systems as CONST_SYSTEMS } from '@/constants/systemcards';

// Example skeleton: swap to Supabase fetch later
export default function useSystems(initial?: SystemCardType[]) {
  const [systems, setSystems] = useState<SystemCardType[]>(initial ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initial) {
      setLoading(true);
      // pretend fetch; replace with real Supabase call
      setTimeout(() => {
        setSystems(CONST_SYSTEMS);
        setLoading(false);
      }, 200);
    }
  }, [initial]);

  return { systems, loading, setSystems };
}
