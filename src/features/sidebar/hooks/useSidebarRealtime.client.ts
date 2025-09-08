// src/features/sidebar/hooks/useSidebarRealtime.client.ts
'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

export function useSidebarRealtime(userId: string | null, onIncrement: () => void) {
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-user-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        onIncrement();
      })
      .subscribe();

    return () => {
      // SDK sürümüne göre iki API’yi de güvenli kapat
      if (channel && typeof (supabase).removeChannel === 'function') {
        (supabase).removeChannel(channel);
      } else if (channel && typeof (channel).unsubscribe === 'function') {
        (channel).unsubscribe();
      }
    };
  }, [userId, onIncrement]);
}
