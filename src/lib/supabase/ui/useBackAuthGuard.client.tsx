// src/lib/supabase/ui/useBackAuthGuard.client.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Options = {
  cooldownMs?: number;
  enabled?: boolean;
  listenFocus?: boolean;
  hiddenMinMs?: number;
};

const LS_KEY = 'auth.lastRouterRefreshAt';
const isClient = typeof window !== 'undefined';

function now(): number {
  return Date.now();
}

function readLastGlobal(): number {
  if (!isClient) return 0;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function writeLastGlobal(ts: number): void {
  if (!isClient) return;
  try {
    window.localStorage.setItem(LS_KEY, String(ts));
  } catch {
    /* storage engelliyse geç */
  }
}

/**
 * BFCache, uzun gizlilik sonrası görünür olma ve offline→online dönüşlerinde router.refresh yapar.
 * Sekmeler arası global cooldown uygular. Fokus dinleme varsayılan kapalı.
 */
export function useBackAuthGuard(opts: Options = {}): void {
  const {
    cooldownMs = 600_000,
    enabled = true,
    listenFocus = false,
    hiddenMinMs = 150_000,
  } = opts;

  const router = useRouter();

  // Render sırasında TARAYICI API’lerine dokunma.
  const lastRefreshLocal = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const wasHiddenAt = useRef<number | null>(null);
  const wasOffline = useRef<boolean>(false);

  // scheduleRefresh'i stabilize et
  const scheduleRefresh = useCallback((): void => {
    if (!enabled || !isClient) return;

    // cooldown kontrolü (local + global)
    const t = now();
    if (t - lastRefreshLocal.current < cooldownMs) return;
    if (t - readLastGlobal() < cooldownMs) return;

    if (rafId.current != null) return;

    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;

      // refresh işaretleri
      const ts = now();
      lastRefreshLocal.current = ts;
      writeLastGlobal(ts);

      // Next router stable olsa da dependency’de tutmak doğru
      router.refresh();
    });
  }, [enabled, cooldownMs, router]);

  type HasPersisted = { persisted?: boolean };

  useEffect(() => {
    if (!enabled || !isClient) return;

    // İlk durumlar yalnızca tarayıcıda alınır
    if (document.visibilityState === 'hidden') {
      wasHiddenAt.current = now();
    }
    wasOffline.current = !navigator.onLine;

    const ac = new AbortController();

    // 1) BFCache dönüşü
    const onPageShow = (e: Event) => {
      const persisted = (e as unknown as HasPersisted).persisted === true;
      if (persisted) scheduleRefresh();
    };

    // 2) Uzun süre gizli kalıp görünür olma
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenAt.current = now();
      } else {
        const hiddenAt = wasHiddenAt.current;
        wasHiddenAt.current = null;
        if (hiddenAt && now() - hiddenAt >= hiddenMinMs) {
          scheduleRefresh();
        }
      }
    };

    // 3) Offline→online
    const onOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        scheduleRefresh();
      }
    };
    
    const onOffline = () => {
      wasOffline.current = true;
    };

    window.addEventListener('pageshow', onPageShow, { signal: ac.signal });
    document.addEventListener('visibilitychange', onVisibility, { signal: ac.signal });
    window.addEventListener('online', onOnline, { signal: ac.signal });
    window.addEventListener('offline', onOffline, { signal: ac.signal });

    if (listenFocus) {
      const onFocus = () => scheduleRefresh();
      window.addEventListener('focus', onFocus, { signal: ac.signal });
    }

    return () => {
      ac.abort();
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [enabled, listenFocus, hiddenMinMs, scheduleRefresh]);

  // Sekmeler arası auth değişimi
  useEffect(() => {
    if (!enabled || !isClient) return;
    const ac = new AbortController();

    const onStorage = (e: StorageEvent) => {
      const key = e.key ?? '';
      if (key.includes('auth') && key.includes('token')) {
        scheduleRefresh();
      }
    };

    window.addEventListener('storage', onStorage, { signal: ac.signal });
    return () => ac.abort();
  }, [enabled, scheduleRefresh]);
}
