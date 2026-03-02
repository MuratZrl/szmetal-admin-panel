// src/app/api/metals/route.ts
//
// Provider: metals.dev (free tier: 100 req/month, no credit card)
// Endpoint: /v1/metal/spot?metal=<name> → returns spot price in USD/mt
// Strategy: 2 API calls (aluminum + copper), cached 24h → ~2/day × 30 = 60/month ✅
//
import { NextResponse } from 'next/server';

// ─── Response types (actual metals.dev format) ───────────
type SpotResponse = {
  status: 'success' | 'failure';
  timestamp: string;           // ISO timestamp
  currency: string;            // "USD"
  unit: string;                // "mt" (metric ton)
  metal: string;               // "aluminum" | "copper"
  rate: {
    price: number;             // USD per metric ton
    ask: number;
    bid: number;
    high: number;
    low: number;
    change: number;            // change amount (USD)
    change_percent: number;    // change percent
  };
};

export type MetalItem = {
  symbol: string;
  name: string;
  priceUSD: number;           // USD per metric ton
  previousCloseUSD: number;
  change: number;
  changePct: number;
  updatedAt: string;
  history: {
    labels: string[];
    data: number[];
  };
};

export type MetalsPayload = {
  available: true;
  metals: MetalItem[];
} | {
  available: false;
};

// ─── Metal configs ───────────────────────────────────────
const METALS = [
  { apiName: 'aluminum', symbol: 'ALU', displayName: 'Alüminyum (LME)' },
  { apiName: 'copper',   symbol: 'CU',  displayName: 'Bakır (LME)' },
] as const;

async function fetchMetal(
  apiKey: string,
  metal: typeof METALS[number],
): Promise<MetalItem | null> {
  try {
    const res = await fetch(
      `https://api.metals.dev/v1/metal/spot?api_key=${apiKey}&metal=${metal.apiName}`,
      { next: { revalidate: 86400 } }, // 24 hours cache
    );

    if (!res.ok) throw new Error(`metals.dev HTTP ${res.status}`);

    const json = (await res.json()) as SpotResponse;

    if (json.status !== 'success') {
      throw new Error(`metals.dev returned non-success for ${metal.apiName}`);
    }

    const { rate } = json;
    if (!rate) throw new Error(`No rate data for ${metal.apiName}`);

    // Price is already in USD per metric ton (unit: "mt")
    const priceUSD = Math.round(rate.price);
    const change = Math.round(rate.change);
    const previousCloseUSD = priceUSD - change;
    const changePct = Math.round(rate.change_percent * 100) / 100;

    return {
      symbol: metal.symbol,
      name: metal.displayName,
      priceUSD,
      previousCloseUSD,
      change,
      changePct,
      updatedAt: json.timestamp || new Date().toISOString(),
      history: { labels: [], data: [] },
    };
  } catch (err) {
    console.error(`[metals.dev:${metal.apiName}]`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.METALS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ available: false } satisfies MetalsPayload);
  }

  try {
    // Fetch all metals in parallel
    const results = await Promise.all(
      METALS.map(m => fetchMetal(apiKey, m)),
    );

    // Filter out failed fetches
    const metals = results.filter((r): r is MetalItem => r !== null);

    if (metals.length === 0) {
      return NextResponse.json({ available: false } satisfies MetalsPayload);
    }

    const payload: MetalsPayload = {
      available: true,
      metals,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[metals.dev]', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { available: false } satisfies MetalsPayload,
    );
  }
}
