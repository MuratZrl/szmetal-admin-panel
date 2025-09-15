// app/api/rates/route.ts
import { NextResponse } from 'next/server';

type RatesPayload = {
  updatedAt: string;
  provider: 'frankfurter' | 'tcmb';
  usdTry: number;
  eurTry: number;
};

type FrankfurterRes = { rates: Record<string, number> };

async function fetchECB(base: 'USD' | 'EUR'): Promise<number> {
  const r = await fetch(
    `https://api.frankfurter.app/latest?from=${base}&to=TRY&amount=1`,
    { next: { revalidate: 3600 } }
  );
  if (!r.ok) throw new Error(`rate_fetch_failed_${base}`);
  const j = (await r.json()) as FrankfurterRes;
  const v = j.rates?.TRY;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`bad_rate_${base}`);
  return v;
}

// 5..500 aralığı dışındaki kurlar ya bozuk ya da kıyamet senaryosu
function isPlausible(n: number): boolean {
  return Number.isFinite(n) && n > 5 && n < 500;
}

// Bazı günlerde 10.000 ölçeği ile gelebiliyor; bunu düzelt.
function normalizeTcmb(n: number): number {
  if (!Number.isFinite(n)) throw new Error('tcmb_nan');
  if (n > 1000 && n < 10_000_000) {
    const scaled = n / 10_000;
    if (isPlausible(scaled)) return scaled;
  }
  return n;
}

function extractTcmb(xml: string, kod: 'USD' | 'EUR', field: 'ForexSelling' | 'ForexBuying'): number {
  const re = new RegExp(
    `<Currency[^>]*Kod="${kod}"[\\s\\S]*?<${field}>([0-9.,]+)</${field}>`,
    'i'
  );
  const m = xml.match(re);
  if (!m) throw new Error(`tcmb_${kod}_not_found`);
  // TR format: binlik "." olabilir, ondalık "," -> "." yapıyoruz
  const raw = m[1];
  const n = Number(raw.replace(/\./g, '').replace(',', '.'));
  return normalizeTcmb(n);
}

async function fetchTCMB(): Promise<{ usd: number; eur: number; date: string }> {
  const r = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', { next: { revalidate: 900 } });
  if (!r.ok) throw new Error('tcmb_fetch_failed');
  const xml = await r.text();
  const usd = extractTcmb(xml, 'USD', 'ForexSelling');
  const eur = extractTcmb(xml, 'EUR', 'ForexSelling');
  return { usd, eur, date: new Date().toISOString() };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const src = (searchParams.get('src') ?? 'ecb').toLowerCase();

    if (src === 'tcmb') {
      try {
        const { usd, eur, date } = await fetchTCMB();
        if (!isPlausible(usd) || !isPlausible(eur)) {
          throw new Error('tcmb_implausible');
        }
        const payload: RatesPayload = { updatedAt: date, provider: 'tcmb', usdTry: usd, eurTry: eur };
        return NextResponse.json(payload);
      } catch {
        // TCMB saçmalarsa ECB'ye düş
        const [usdTry, eurTry] = await Promise.all([fetchECB('USD'), fetchECB('EUR')]);
        const payload: RatesPayload = {
          updatedAt: new Date().toISOString(),
          provider: 'frankfurter',
          usdTry,
          eurTry,
        };
        return NextResponse.json(payload);
      }
    }

    // ECB
    const [usdTry, eurTry] = await Promise.all([fetchECB('USD'), fetchECB('EUR')]);
    const payload: RatesPayload = {
      updatedAt: new Date().toISOString(),
      provider: 'frankfurter',
      usdTry,
      eurTry,
    };
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
