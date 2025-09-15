// src/features/requests/services/id/request.server.ts
import 'server-only';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

import type {
  RequestStatus,
  AdaptedRequestRow,
  FormData,
  SummaryItem,
  RawRow,
  MaterialItem,
  MaterialRow,
} from '@/features/requests/types';

// ----------------- küçük yardımcılar -----------------
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// küçük yardımcı:
function asStringOrNull(v: unknown): string | null { return typeof v === 'string' ? v : null; }

export function asNumberOr(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const s = v.trim().replace(/\s+/g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function isUuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function candidateSlugs(raw: string): string[] {
  const dec = decodeURIComponent(raw);
  const hyphensToSpace = dec.replace(/-/g, ' ');
  const lower = dec.toLowerCase();
  const lowerSpace = hyphensToSpace.toLowerCase();
  const spaceToHyphens = dec.replace(/\s+/g, '-');
  const lowerHyphen = spaceToHyphens.toLowerCase();
  return Array.from(new Set([dec, lower, hyphensToSpace, lowerSpace, spaceToHyphens, lowerHyphen]));
}

// ----------------- JSON parse adaptörleri -----------------
export function parseFormData(v: unknown): FormData {
  if (!isRecord(v)) return {};
  return {
    description: asStringOrNull(v.description),
    sistem_adet: asStringOrNull(v.sistem_adet),
    sistem_genislik: asStringOrNull(v.sistem_genislik),
    sistem_yukseklik: asStringOrNull(v.sistem_yukseklik),
  };
}

export function parseSummaryData(v: unknown): SummaryItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isRecord)
    .map(o => ({
      id: asNumberOr(o.id, 0),
      toplam_kg: String(o.toplam_kg ?? ''),
      cam_metraj: String(o.cam_metraj ?? ''),
      sistem_metraj: String(o.sistem_metraj ?? ''),
      kayar_cam_adet: String(o.kayar_cam_adet ?? ''),
      kayar_cam_genislik: String(o.kayar_cam_genislik ?? ''),
      kayar_cam_yukseklik: String(o.kayar_cam_yukseklik ?? ''),
    }))
    .filter(o => o.id !== 0 || o.toplam_kg.length > 0);
}

export function parseMaterialData(v: unknown): MaterialItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isRecord)
    .map(o => ({
      kesim_adet: asNumberOr(o.kesim_adet, 0),
      profil_adi: String(o.profil_adi ?? ''),
      profil_kodu: String(o.profil_kodu ?? ''),
      kesim_olcusu: String(o.kesim_olcusu ?? ''),
      profil_resmi: String(o.profil_resmi ?? ''),
      birim_agirlik: asNumberOr(o.birim_agirlik, 0),
      verilecek_adet: asNumberOr(o.verilecek_adet, 0),
    }));
}

function asStatus(v: unknown): RequestStatus {
  const s = typeof v === 'string' ? v.toLowerCase() : 'pending';
  return s === 'approved' || s === 'rejected' ? s : 'pending';
}

export function adaptRow(d: RawRow & { user_id?: unknown; status?: unknown }): AdaptedRequestRow {
  return {
    id: String(d.id),
    user_id: asStringOrNull(d.user_id),      // ← eklendi
    system_slug: String(d.system_slug ?? ''),
    status: asStatus(d.status),          // ← eklendi
    form_data: parseFormData(d.form_data),
    summary_data: parseSummaryData(d.summary_data),
    material_data: parseMaterialData(d.material_data),
  };
}

// ----------------- DB erişimi -----------------
export async function fetchRequestByParam(idOrSlug: string): Promise<AdaptedRequestRow | null> {
  const supabase = await createSupabaseServerClient();

  // 1) UUID ise doğrudan
  if (isUuidLike(idOrSlug)) {
    const { data, error } = await supabase
      .from('requests')
      .select('id, user_id, system_slug, status, form_data, summary_data, material_data, created_at')
      .eq('id', idOrSlug)
      .single();

    if (error || !data) return null;
    return adaptRow(data as RawRow);
  }

  // 2) Eski slug linkleri
  const candidates = candidateSlugs(idOrSlug);
  const { data, error } = await supabase
    .from('requests')
    .select('id, user_id, system_slug, status, form_data, summary_data, material_data, created_at')
    .in('system_slug', candidates)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // Canonical URL: /requests/:id
  const got = data as RawRow;
  if (idOrSlug !== got.id) {
    redirect(`/requests/${encodeURIComponent(got.id)}`);
  }
  return adaptRow(got);
}

// ----------------- Görünüme hazır hesaplamalar -----------------
export function buildMaterialRows(items: MaterialItem[]): MaterialRow[] {
  return items.map((m, i) => {
    const toplam = (m.birim_agirlik ?? 0) * (m.verilecek_adet ?? 0);
    return {
      id: `${m.profil_kodu}-${i}`,
      ...m,
      toplam_agirlik: Number.isFinite(toplam) ? toplam : 0,
    };
  });
}
