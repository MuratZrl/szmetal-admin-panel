'use client';
// src/lib/supabase/ui/useBackAuthGuard.client.tsx

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Options = {
  cooldownMs?: number;   // sekmeler arası global soğuma
  enabled?: boolean;     // feature flag
  listenFocus?: boolean; // odakla tetikle
  hiddenMinMs?: number;  // şu kadar gizli kaldıysa dönünce yenile
};

const LS_KEY = 'auth.lastRouterRefreshAt';
const isClient = typeof window !== 'undefined';

function now(): number { return Date.now(); }

function readLastGlobal(): number {
  if (!isClient) return 0;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeLastGlobal(ts: number): void {
  if (!isClient) return;
  try { window.localStorage.setItem(LS_KEY, String(ts)); } catch {}
}

export function useBackAuthGuard(opts: Options = {}): void {
  const {
    cooldownMs = 600_000,  // 10 dk
    enabled = true,
    listenFocus = false,
    hiddenMinMs = 150_000, // 2.5 dk
  } = opts;

  const router = useRouter();

  // Yerel soğuma ve planlamacılar
  const lastRefreshLocal = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const debounceTid = useRef<number | null>(null);

  // Durum ref’leri
  const wasHiddenAt = useRef<number | null>(null);
  const wasOffline = useRef<boolean>(false);
  const mounted = useRef<boolean>(false);

  // Çekirdek: şartlar uygunsa refresh et
  const scheduleRefreshCore = useCallback((): void => {
    if (!enabled || !isClient) return;

    // Arka planda gereksiz yenileme yok
    if (document.visibilityState === 'hidden') return;

    const t = now();
    if (t - lastRefreshLocal.current < cooldownMs) return;
    if (t - readLastGlobal() < cooldownMs) return;
    if (rafId.current != null) return;

    rafId.current = window.requestAnimationFrame(() => {
      rafId.current = null;
      if (!mounted.current) return; // unmount sonrası güvenlik
      const ts = now();
      lastRefreshLocal.current = ts;
      writeLastGlobal(ts);
      router.refresh();
    });
  }, [enabled, cooldownMs, router]);

  // Debounce: 1 sn içinde gelen çoklu tetikleri tekine indir
  const scheduleRefresh = useCallback(() => {
    if (!enabled) return;
    if (debounceTid.current != null) return;
    debounceTid.current = window.setTimeout(() => {
      debounceTid.current = null;
      scheduleRefreshCore();
    }, 1000);
  }, [enabled, scheduleRefreshCore]);

  type HasPersisted = { persisted?: boolean };

  useEffect(() => {
    if (!enabled || !isClient) return;

    mounted.current = true;
    if (document.visibilityState === 'hidden') wasHiddenAt.current = now();
    wasOffline.current = !navigator.onLine;

    const ac = new AbortController();

    const onPageShow = (e: Event) => {
      // BFCache’ten dönüyorsak (geri/ileri), yenile
      const persisted = (e as unknown as HasPersisted).persisted === true;
      if (persisted) scheduleRefresh();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenAt.current = now();
      } else {
        const hiddenAt = wasHiddenAt.current;
        wasHiddenAt.current = null;
        if (hiddenAt && now() - hiddenAt >= hiddenMinMs) scheduleRefresh();
      }
    };

    const onOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        scheduleRefresh();
      }
    };

    const onOffline = () => { wasOffline.current = true; };

    window.addEventListener('pageshow', onPageShow, { signal: ac.signal });
    document.addEventListener('visibilitychange', onVisibility, { signal: ac.signal });
    window.addEventListener('online', onOnline, { signal: ac.signal });
    window.addEventListener('offline', onOffline, { signal: ac.signal });

    if (listenFocus) {
      const onFocus = () => scheduleRefresh();
      window.addEventListener('focus', onFocus, { signal: ac.signal });
    }

    return () => {
      mounted.current = false;
      ac.abort();
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (debounceTid.current != null) {
        clearTimeout(debounceTid.current);
        debounceTid.current = null;
      }
    };
  }, [enabled, listenFocus, hiddenMinMs, scheduleRefresh]);

  // Sekmeler arası auth değişimini yakala (Supabase anahtar paterniyle)
  useEffect(() => {
    if (!enabled || !isClient) return;
    const ac = new AbortController();

    let lastSeen = 0;
    const onStorage = (e: StorageEvent) => {
      const key = e.key ?? '';
      // Supabase: sb-<project-ref>-auth-token
      if (/^sb-.*-auth-token$/.test(key)) {
        const t = now();
        if (t - lastSeen > 2000) scheduleRefresh();
        lastSeen = t;
      }
    };

    window.addEventListener('storage', onStorage, { signal: ac.signal });
    return () => ac.abort();
  }, [enabled, scheduleRefresh]);
}
