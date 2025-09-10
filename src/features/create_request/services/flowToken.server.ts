// src/features/create_request/services/flowToken.server.ts
import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'cr_flow';
const secret = new TextEncoder().encode(
  process.env.FLOW_TOKEN_SECRET ?? 'dev-secret-change-me'
);

export type FlowToken = {
  userId: string;
  slug: string;
  step: 1 | 2 | 3;
};

async function signFlowToken(payload: FlowToken): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

// SADECE Server Action veya Route Handler içinde çağır.
export async function setFlowCookie(payload: FlowToken): Promise<void> {
  const token = await signFlowToken(payload);
  const store = await cookies();
  store.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 2,
  });
}

// Route Handler için: NextResponse üstünden çerez yaz.
export async function setFlowCookieOnResponse(res: NextResponse, payload: FlowToken): Promise<void> {
  const token = await signFlowToken(payload);
  res.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 2,
  });
}

export async function readFlowCookie(): Promise<FlowToken | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  try {
    const { payload } = await jwtVerify(raw, secret, { algorithms: ['HS256'] });
    const p = payload as unknown as FlowToken;
    if (!p?.userId || !p?.slug || !p?.step) return null;
    return p;
  } catch {
    return null;
  }
}

export async function clearFlowCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
