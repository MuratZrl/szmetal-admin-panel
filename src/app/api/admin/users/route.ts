// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/supabaseAdmin';
import { createSupabaseRouteClient } from '@/lib/supabase/supabaseServer';

import { requireAdminApi, type Role, type UserStatus } from '@/lib/supabase/auth/guards.server';
import type { Database } from '@/types/supabase';

type UsersTable = Database['public']['Tables']['users'];
type UsersInsert = UsersTable['Insert'];

export const runtime = 'nodejs';

type Payload = {
  email: string;
  username?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
  invite?: boolean;     // true → davetiye e-postası gönder
  redirectTo?: string;  // davetiye linki hedefi
};

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizeUsername(name?: string): string | undefined {
  const n = (name ?? '').replace(/\s+/g, ' ').trim();
  return n.length ? n : undefined;
}

/** Insert tipine "id" sığmadığı için TS'i sakinleştiren payload builder */
function buildProfileUpsert(args: {
  id: string;
  email: string;
  username?: string;
  role: Role;
  status: UserStatus;
}): UsersInsert {
  const { id, email, username, role, status } = args;

  // username null gönderme; boşsa hiç gönderme
  const record = {
    id,
    email,
    role,
    status,
    ...(username ? { username } : {}),
  };

  // "any" yok, ama Insert tipinde id olmadığı için bilinçli cast yapıyoruz.
  return record as unknown as UsersInsert;
}

export async function POST(req: NextRequest) {
  // 1) Çağıran gerçekten Admin mi?
  const rw = await createSupabaseRouteClient();
  const gate = await requireAdminApi(rw);

  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  // 2) Girdi
  const body = (await req.json()) as Payload;
  const email = (body.email ?? '').trim().toLowerCase();
  const username = normalizeUsername(body.username);
  const role: Role = body.role ?? 'User';
  const status: UserStatus = body.status ?? 'Active';
  const invite = Boolean(body.invite);
  const redirectTo = body.redirectTo ?? `${req.nextUrl.origin}/login`;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Geçerli bir e-posta girin' }, { status: 400 });
  }
  if (!invite && (!body.password || body.password.length < 8)) {
    return NextResponse.json({ error: 'Parola en az 8 karakter olmalı' }, { status: 400 });
  }

  // 3) Admin client ile işlem
  const admin = createSupabaseAdminClient();

  try {
    if (invite) {
      // 3a) Davet: kullanıcıyı oluştur ve mail gönder
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { username, role, status },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      const created = data.user;
      if (!created) {
        return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 400 });
      }

      // Profil satırını yaz (trigger yoksa gerekli)
      const payload = buildProfileUpsert({
        id: created.id,
        email,
        username,
        role,
        status,
      });
      const { error: upsertErr } = await admin
        .from('users')
        .upsert(payload, { onConflict: 'id' });
      if (upsertErr) {
        return NextResponse.json({ error: upsertErr.message }, { status: 400 });
      }

      return NextResponse.json({ id: created.id, invited: true }, { status: 201 });
    }

    // 3b) Doğrudan oluştur: e-posta onaylı
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: body.password!,
      email_confirm: true,
      user_metadata: { username, role, status },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const created = data.user;
    if (!created) {
      return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 400 });
    }

    const payload = buildProfileUpsert({
      id: created.id,
      email,
      username,
      role,
      status,
    });
    const { error: upsertErr } = await admin
      .from('users')
      .upsert(payload, { onConflict: 'id' });
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 400 });
    }

    return NextResponse.json({ id: created.id, invited: false }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


/**
 * POST /api/admin/users
 * Amaç: Admin oturumu ile yeni kullanıcı oluşturmak veya davet göndermek.
 *
 * Body (JSON):
 * {
 *   "email": "ali@example.com",
 *   "password": "Sifre123!",     // invite=true iken gerekmez
 *   "username": "Ali Veli",
 *   "role": "User" | "Manager" | "Admin",
 *   "status": "Active" | "Inactive" | "Banned",
 *   "invite": false,              // true → davetiye e-postası gönder
 *   "redirectTo": "https://site/login" // opsiyonel, invite modunda
 * }
 *
 * Yetki:
 * - İstek aynı origin’den ve Admin login cookie’siyle gelmeli.
 * - Değilse 401/403 döner. CSRF için Origin/Referer kontrolü var.
 *
 * Başarılı Yanıtlar:
 * - 201 { "id": "<user-id>", "invited": false | true }
 *
 * Hata Yanıtları (örnekler):
 * - 400 { "error": "Parola en az 8 karakter olmalı" }
 * - 401 { "error": "unauthorized" }
 * - 403 { "error": "role" | "inactive" | "banned" | "origin" }
 *
 * Hızlı kullanım (tarayıcı konsolu, Admin girişliyken):
 * fetch('/api/admin/users', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     email: 'ali@example.com',
 *     password: 'Sifre123!',
 *     username: 'Ali Veli',
 *     role: 'User',
 *     status: 'Active',
 *     invite: false
 *   })
 * }).then(async r => {
 *   const t = await r.text();
 *   try { console.log(r.status, JSON.parse(t)); } catch { console.log(r.status, t); }
 * });
 *
 * Notlar:
 * - public.users satırı upsert edilir (onConflict: 'id').
 * - Admin üretimini kısıtlamak istersen: ROOT_ADMIN_ID ile yalnızca tek kişiye izin ver.
 */