// src/features/requests/services/table.server.ts
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import { RequestTableRow, GetTableOpts, TablePage } from '@/features/requests/types';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

const USER_FIELDS = ['username', 'email', 'phone', 'company', 'country'] as const;
type UserField = typeof USER_FIELDS[number];

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function getStringField(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  return String(v);
}

export async function getRequestsTablePage(opts?: GetTableOpts): Promise<TablePage> {
  const {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    sortField = 'created_at',
    sortDir = 'desc',
    status = 'all',
  } = opts ?? {};

  const supabase = await createSupabaseServerClient();
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  const isUserField = USER_FIELDS.includes(sortField as UserField);
  const orderField = isUserField ? (sortField as UserField) : sortField;

  // Terminalde gördüğün ilişki isimlerini buraya ekle. Hata mesajı "users!fk_user" gibi önerir.
  const relationCandidates = ['users!fk_user', 'users!requests_user_id_fkey', 'users'];

  // 1) Embed deneyerek çekme (ilişki isimlerini sırayla dener)
  for (const rel of relationCandidates) {
    const relKey = rel.split('!')[0];
    const selectExpr = `id, system_slug, created_at, status, ${rel}(image, username, email, phone, company, country, id)`;

    try {
      let q = supabase
        .from('requests')
        .select(selectExpr, { count: 'exact' })
        .range(fromIdx, toIdx);

      if (status && status !== 'all') q = q.eq('status', status);

      if (isUserField) {
        // Supabase client tipleri bazen foreignTable prop'ını yakalamıyor; runtime'da çalışması gerekiyor.
        // Bu yüzden aşağıdaki satırda ts hatası bastırılıyor (NOT any).
        q = q.order(orderField, { ascending: sortDir === 'asc', foreignTable: rel });
      } else {
        q = q.order(orderField, { ascending: sortDir === 'asc' });
      }

      const res = await q;
      const data = res.data;
      const count = res.count;
      const error = res.error;

      if (error) {
        // Eğer PostgREST embed conflict hatasıysa diğer relation candidate'ı dene
        if (error.code === 'PGRST201') {
          continue;
        }
        console.error('getRequestsTablePage error (embed attempt):', error);
        return { rows: [], total: 0, page, pageSize };
      }

      if (!Array.isArray(data)) {
        // beklenmedik dönüş
        return { rows: [], total: 0, page, pageSize };
      }

      const rows: RequestTableRow[] = data.map((r): RequestTableRow => {
        if (!isRecord(r)) {
          return {
            id: 'unknown',
            image: null,
            username: null,
            email: null,
            system_slug: null,
            phone: null,
            company: null,
            country: null,
            created_at: null,
          };
        }

        const usersVal = r[relKey] ?? r['users'];
        let image: string | null = null;
        let username: string | null = null;
        let email: string | null = null;
        let phone: string | null = null;
        let company: string | null = null;
        let country: string | null = null;
        let user_id: string | null = null;

        if (isRecord(usersVal)) {
          image = getStringField(usersVal, 'image');
          username = getStringField(usersVal, 'username');
          email = getStringField(usersVal, 'email');
          phone = getStringField(usersVal, 'phone');
          company = getStringField(usersVal, 'company');
          country = getStringField(usersVal, 'country');
          user_id = getStringField(usersVal, 'id');
        }

        return {
          id: getStringField(r, 'id') ?? 'unknown',
          system_slug: getStringField(r, 'system_slug'),
          created_at: getStringField(r, 'created_at'),
          status: getStringField(r, 'status'),
          username,
          image,
          email,
          phone,
          company,
          country,
          user_id,
        };
      });

      return {
        rows,
        total: typeof count === 'number' ? count : rows.length,
        page,
        pageSize,
      };
    } catch (err) {
      // Embed denemesi çalışmadıysa diğer ilişki adını dene
      console.warn('embed relation attempt failed for', rel, err);
      continue;
    }
  }

  // 2) Fallback: embed başarısızsa requests'i user_id ile çek, sonra users tablosundan batch ile eşle
  try {
    let q = supabase
      .from('requests')
      .select('id, system_slug, created_at, status, user_id', { count: 'exact' })
      .range(fromIdx, toIdx);

    if (status && status !== 'all') q = q.eq('status', status);
    if (!isUserField) q = q.order(orderField, { ascending: sortDir === 'asc' });
    else q = q.order('created_at', { ascending: false });

    const resReq = await q;
    const reqData = resReq.data;
    const count = resReq.count;
    const reqError = resReq.error;

    if (reqError) {
      console.error('getRequestsTablePage error (fallback requests):', reqError);
      return { rows: [], total: 0, page, pageSize };
    }

    if (!Array.isArray(reqData)) {
      return { rows: [], total: 0, page, pageSize };
    }

    const requestsArr = reqData.filter(isRecord);

    const userIds = Array.from(
      new Set(
        requestsArr
          .map(r => {
            const v = r['user_id'];
            if (v === null || v === undefined) return null;
            return typeof v === 'string' ? v : String(v);
          })
          .filter((x): x is string => typeof x === 'string')
      )
    );

    const usersMap: Record<string, Record<string, unknown>> = {};

    if (userIds.length > 0) {
      const resUsers = await supabase
        .from('users')
        .select('id, image, username, email, phone, company, country')
        .in('id', userIds);

      const usersData = resUsers.data;
      const usersError = resUsers.error;

      if (usersError) {
        console.warn('getRequestsTablePage warning: could not fetch users for fallback mapping:', usersError);
      } else if (Array.isArray(usersData)) {
        for (const u of usersData.filter(isRecord)) {
          const idVal = getStringField(u, 'id');
          if (idVal) usersMap[idVal] = u;
        }
      }
    }

    const rows: RequestTableRow[] = requestsArr.map(r => {
      const id = getStringField(r, 'id') ?? 'unknown';
      const system_slug = getStringField(r, 'system_slug');
      const created_at = getStringField(r, 'created_at');
      const statusVal = getStringField(r, 'status');
      const user_id = getStringField(r, 'user_id');

      const u = user_id ? usersMap[user_id] : undefined;

      return {
        id,
        system_slug,
        created_at,
        status: statusVal,
        image: u ? getStringField(u, 'image') : null,
        username: u ? getStringField(u, 'username') : null,
        email: u ? getStringField(u, 'email') : null,
        phone: u ? getStringField(u, 'phone') : null,
        company: u ? getStringField(u, 'company') : null,
        country: u ? getStringField(u, 'country') : null,
        user_id: user_id ?? null,
      };
    });

    return {
      rows,
      total: typeof count === 'number' ? count : rows.length,
      page,
      pageSize,
    };
  } catch (err) {
    console.error('getRequestsTablePage final fallback error:', err);
    return { rows: [], total: 0, page, pageSize };
  }
}
