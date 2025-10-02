// app/api/healthz/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SupabaseProbe = {
  configured: boolean;
  connected: boolean;
  error: string | null;
};

type HealthzPayload = {
  ok: true;
  now: string;
  uptime_s: number;
  node: string;
  commit: string | null;
  version: string | null;
  memory: {
    rss_mb: number;
    heap_used_mb: number;
  };
  env: {
    mode: string;
  };
  supabase: SupabaseProbe;
};

function mb(n: number): number {
  return Math.round((n / 1024 / 1024) * 100) / 100;
}

export async function GET() {
  const nowIso = new Date().toISOString();
  const mu = process.memoryUsage();
  const commit =
    process.env.NEXT_PUBLIC_BUILD_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseProbe: SupabaseProbe = {
    configured: Boolean(supabaseUrl && supabaseKey),
    connected: false,
    error: null,
  };

  if (supabaseProbe.configured) {
    try {
      const jar = await cookies();
      const sb = createServerClient(
        supabaseUrl as string,
        supabaseKey as string,
        {
          cookies: {
            get: (name: string) => jar.get(name)?.value,
            set() {
              /* healthz: no-op */
            },
            remove() {
              /* healthz: no-op */
            },
          },
        }
      );

      // Ağ/anahtar doğrulaması için hafif bir çağrı yeterli
      const { error } = await sb.auth.getSession();
      if (error) {
        supabaseProbe.error = error.message;
      } else {
        // Session yoksa da bağlantı kurulmuş sayılır (anon erişim)
        supabaseProbe.connected = true;
      }
    } catch (e) {
      supabaseProbe.error =
        e instanceof Error ? e.message : 'Unknown Supabase error';
    }
  }

  const payload: HealthzPayload = {
    ok: true,
    now: nowIso,
    uptime_s: Math.round(process.uptime()),
    node: process.version,
    commit,
    version: process.env.npm_package_version ?? null,
    memory: {
      rss_mb: mb(mu.rss),
      heap_used_mb: mb(mu.heapUsed),
    },
    env: {
      mode: process.env.NODE_ENV ?? 'development',
    },
    supabase: supabaseProbe,
  };

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    status: 200,
  });
}

export async function HEAD() {
  // 204 No Content, cache yok
  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
