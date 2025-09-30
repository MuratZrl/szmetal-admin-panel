// src/features/sidebar/hooks/useSidebarRealtime.client.ts
'use client';

/**
 * Realtime unread counter for the sidebar.
 *
 * Features:
 * - Subscribes to Postgres INSERT events from `public.notifications` for a single user.
 * - Debounces bursts of inserts and applies a single batched increment to avoid re-render storms.
 * - Pauses the subscription when the tab is hidden (optional, defaults to true) to save resources.
 * - Survives callback identity changes without re-subscribing.
 * - Cleans up safely across supabase-js v2 channel APIs (`removeChannel` and `unsubscribe`).
 *
 * Backward compatible signature:
 *    useSidebarRealtime(userId, onIncrement)
 *
 * Extended usage with options:
 *    useSidebarRealtime(userId, onIncrement, { debounceMs: 300, pauseWhenHidden: true })
 *
 * Example:
 *    useSidebarRealtime(userId, () => setUnread(v => v + 1));
 */

import * as React from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';

type BaseEvent = {
  /** Event action type (we only listen to INSERT, but keep this extensible) */
  type: 'INSERT';
};

type NotificationRow = {
  /** Target user id in notifications table used by server-side trigger/broadcast */
  user_id: string;
  /** Any additional columns you might have; keep optional to avoid leaking "any" */
  id?: string;
  created_at?: string;
  [k: string]: unknown;
};

type UseSidebarRealtimeOptions = {
  /**
   * Schema that contains the notifications table.
   * Defaults to 'public'
   */
  schema?: string;
  /**
   * Table name to listen on.
   * Defaults to 'notifications'
   */
  table?: string;
  /**
   * When multiple INSERTs arrive quickly, group them into one flush.
   * The callback will be invoked N times to preserve backward compatibility.
   * Defaults to 250ms.
   */
  debounceMs?: number;
  /**
   * If true, unsubscribes while the page is hidden and resumes on visibility.
   * Saves CPU and network. Defaults to true.
   */
  pauseWhenHidden?: boolean;
  /**
   * Optional low-level event tap in case you want to inspect payloads.
   * Runs for every INSERT received.
   */
  onEvent?: (ev: BaseEvent & { new: NotificationRow }) => void;
};

const DEFAULTS: Required<Pick<
  UseSidebarRealtimeOptions,
  'schema' | 'table' | 'debounceMs' | 'pauseWhenHidden'
>> = {
  schema: 'public',
  table: 'notifications',
  debounceMs: 250,
  pauseWhenHidden: true,
};

export function useSidebarRealtime(
  userId: string | null,
  onIncrement: () => void,
  opts?: UseSidebarRealtimeOptions
): void {
  // Merge options with defaults once, memoized by stable keys
  const options = React.useMemo(() => ({ ...DEFAULTS, ...(opts ?? {}) }), [opts]);

  // Keep the latest onIncrement without triggering resubscribe
  const onIncrementRef = React.useRef(onIncrement);
  React.useEffect(() => {
    onIncrementRef.current = onIncrement;
  }, [onIncrement]);

  // Optional raw event tap, also kept stable
  const onEventRef = React.useRef(options.onEvent);
  React.useEffect(() => {
    onEventRef.current = options.onEvent;
  }, [options.onEvent]);

  // Channel instance ref so we can tear it down exactly once
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  // Small buffer to debounce bursts and avoid re-render storms on big inserts
  const bufferRef = React.useRef<number>(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper: flush buffered increments
  const flush = React.useCallback(() => {
    const count = bufferRef.current;
    bufferRef.current = 0;
    if (count > 0) {
      // Preserve legacy callback semantics by calling it N times,
      // so callers that do setState(v => v + 1) keep working.
      for (let i = 0; i < count; i += 1) {
        onIncrementRef.current();
      }
    }
  }, []);

  // Helper: schedule a debounced flush
  const scheduleFlush = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      flush();
    }, options.debounceMs);
  }, [flush, options.debounceMs]);

  // Build a stable channel name so reconnects are predictable in the DevTools
  const channelName = React.useMemo(
    () => (userId ? `notifications-user-${userId}` : null),
    [userId]
  );

  // Visibility handling: we want to pause the channel when hidden (optional)
  const [isVisible, setIsVisible] = React.useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState !== 'hidden';
  });

  React.useEffect(() => {
    if (!options.pauseWhenHidden) return;
    if (typeof document === 'undefined') return;

    const handler = () => setIsVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handler, { passive: true });
    return () => document.removeEventListener('visibilitychange', handler);
  }, [options.pauseWhenHidden]);

  // Subscribe or tear down depending on userId and visibility
  React.useEffect(() => {
    // Preconditions: need a user and either visible or the feature is disabled
    const shouldSubscribe = Boolean(userId) && (isVisible || !options.pauseWhenHidden);
    if (!shouldSubscribe) {
      // No user or hidden tab: clean up any existing channel
      if (channelRef.current) {
        safeCloseChannel(channelRef.current);
        channelRef.current = null;
      }
      // Ensure any pending buffer is applied so badge doesn't lag
      flush();
      return;
    }

    // Avoid duplicate channels if a stale one is hanging around
    if (channelRef.current) {
      safeCloseChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create the channel
    const channel = supabase
      .channel(channelName!, {
        // Fine defaults; if you have high burst traffic consider fast lane config here
        config: { broadcast: { ack: false } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: options.schema,
          table: options.table,
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          // Type the payload gently: supabase returns unknown shape, coerce to our minimal row
          const row = (payload as unknown as { new: NotificationRow }).new;

          // Optional external tap
          if (onEventRef.current) {
            onEventRef.current({ type: 'INSERT', new: row });
          }

          // Buffer and debounce to reduce renders
          bufferRef.current += 1;
          scheduleFlush();

          // Helpful dev log without spamming production
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[realtime] +1 notification for user', userId, row?.id ?? '(no id)');
          }
        }
      )
      .subscribe((status, err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[realtime] channel status:', status, err ?? '');
        }
      });

    channelRef.current = channel;

    // Cleanup when deps change
    return () => {
      if (channelRef.current) {
        safeCloseChannel(channelRef.current);
        channelRef.current = null;
      }
      flush();
    };
  }, [userId, channelName, options.schema, options.table, isVisible, options.pauseWhenHidden, scheduleFlush, flush]);

  // On unmount: hard cleanup and flush any pending increments
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      if (channelRef.current) {
        safeCloseChannel(channelRef.current);
        channelRef.current = null;
      }
      flush();
    };
  }, [flush]);
}

/**
 * Close a Supabase Realtime channel safely across SDK surfaces.
 * - supabase.removeChannel(channel) is the v2 preferred API.
 * - channel.unsubscribe() exists on the channel object and can be used as a fallback.
 */
function safeCloseChannel(channel: RealtimeChannel): void {
  try {
    const client = supabase as unknown as { removeChannel?: (c: RealtimeChannel) => void };
    if (typeof client.removeChannel === 'function') {
      client.removeChannel(channel);
      return;
    }
    // Fallback for other environments
    const maybeUnsub = (channel as unknown as { unsubscribe?: () => void }).unsubscribe;
    if (typeof maybeUnsub === 'function') {
      maybeUnsub();
    }
  } catch {
    // ignore, we’re cleaning up anyway
  }
}
