// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';
import type { Database, Tables } from '@/types/supabase';
import { mapRowToProduct, type ProductListResponse } from '@/features/products/types';

// Üstte:
type UsersRow = Tables<'users'>;
type Role = UsersRow['role'];
type UserId = UsersRow['id'];

type Products = Database['public']['Tables']['products'];
type ProductRow = Products['Row'];
type ProductInsert = Products['Insert'];

type Orderable<Q> = {
  order: (column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) => Q;
};

// Tiny helper: update’de yaptığınız cast yaklaşımı
function asInsertParam<T>(v: T) {
  return v as unknown as never;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  if (i < min) return min;
  if (i > max) return max;
  return i;
}

function sanitizeLike(raw: string): string {
  // PostgREST or() string’inde virgül/paren işleri tatsız sonuçlar doğurabiliyor.
  // Burada “kullanıcı saçmalarsa endpoint patlamasın” diye hafif temizliyoruz.
  return raw.replace(/[(),]/g, ' ').trim();
}

function parseCustomerMoldParam(raw: string | null): boolean | null {
  if (!raw) return null;

  const v = raw.trim().toLocaleLowerCase('tr');

  // Evet tarafı
  if (v === 'evet' || v === 'true' || v === '1' || v === 'mold') return true;

  // Hayır tarafı
  if (v === 'hayır' || v === 'hayir' || v === 'false' || v === '0' || v === 'nonmold' || v === 'non_mold')
    return false;

  return null;
}

function parseAvailabilityParam(raw: string | null): boolean | null {
  if (!raw) return null;

  const v = raw.trim().toLocaleLowerCase('tr');

  // Senin eski mantık: availability=0 => "Kullanılamaz"
  if (v === '0' || v === 'false' || v === 'unavailable') return false;

  if (v === '1' || v === 'true' || v === 'available') return true;

  return null;
}

function applySort<Q extends Orderable<Q>>(q: Q, sortRaw: string | null): Q {
  const sort = (sortRaw ?? 'date-desc').trim();

  switch (sort) {
    case 'date-asc':
      return q.order('date', { ascending: true }).order('id', { ascending: true });

    case 'code-asc':
      return q.order('code', { ascending: true }).order('id', { ascending: true });

    case 'code-desc':
      return q.order('code', { ascending: false }).order('id', { ascending: true });

    case 'weight-asc':
      return q
        .order('unit_weight_g_pm', { ascending: true, nullsFirst: false }) // nulls last
        .order('id', { ascending: true });

    case 'weight-desc':
      return q
        .order('unit_weight_g_pm', { ascending: false, nullsFirst: false }) // nulls last
        .order('id', { ascending: true });

    case 'date-desc':
    default:
      return q.order('date', { ascending: false }).order('id', { ascending: true });
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();

  // Auth (listeleme için Admin şart değil, login olmuş olması yeter)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // İstersen burada status kontrolü de yapabilirsin (Active/Inactive/Banned).
  // Banned zaten login olamıyor demiştin, o yüzden şimdilik dokunmuyorum.

  const sp = req.nextUrl.searchParams;

  const page = clampInt(sp.get('page'), 1, 1, 10_000);
  const pageSize = clampInt(sp.get('pageSize'), 24, 1, 200);

  const qRaw = sp.get('q') ?? '';
  const qNeedle = sanitizeLike(qRaw);

  const cmRaw = sp.get('customerMold');
  const cmBool = parseCustomerMoldParam(cmRaw); // true/false/null

  const availabilityRaw = sp.get('availability');
  const availabilityBool = parseAvailabilityParam(availabilityRaw); // true/false/null

  const variants = sp.getAll('variants').filter((x) => x.trim().length > 0);

  const from = (sp.get('from') ?? '').trim();
  const to = (sp.get('to') ?? '').trim();

  const sort = sp.get('sort');

  // Query
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (qNeedle) {
    const like = `%${qNeedle}%`;
    query = query.or(`name.ilike.${like},code.ilike.${like}`);
  }

  // ✅ Müşteri kalıbı filtresi: işin kritik kısmı burada.
  // cmBool === true  -> has_customer_mold = true
  // cmBool === false -> has_customer_mold = false
  if (cmBool === true) query = query.eq('has_customer_mold', true);
  if (cmBool === false) query = query.eq('has_customer_mold', false);

  // ✅ Kullanılabilirlik filtresi: true/false
  if (availabilityBool === true) query = query.eq('availability', true);
  if (availabilityBool === false) query = query.eq('availability', false);

  if (variants.length > 0) {
    query = query.in('variant', variants);
  }

  query = applySort(query, sort);
  
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  const { data, error, count } = await query.range(fromIdx, toIdx);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const items = (data ?? []).map((r) => mapRowToProduct(r as ProductRow));
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  const payload: ProductListResponse = { items, pageCount };
  return NextResponse.json(payload, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseRouteClient();

  // 1) Auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Role check
  const { data: prof, error: profErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id as UserId)
    .single<{ role: Role }>();

  if (profErr || !prof) {
    return NextResponse.json({ error: profErr?.message ?? 'Profile not found' }, { status: 400 });
  }
  if (prof.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3) Payload
  const input = (await req.json()) as ProductInsert;

  // 4) Insert
  const { data, error } = await supabase
    .from('products')
    .insert(asInsertParam<ProductInsert>(input))
    .select('*')
    .single<ProductRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
