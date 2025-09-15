// src/features/requests/types.ts

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type AdaptedRequestRow = {
  id: string;
  user_id: string | null;
  system_slug: string;
  status: RequestStatus;
  form_data: FormData;
  summary_data: SummaryItem[];
  material_data: MaterialItem[];
};

// ————— Detay sayfasındaki JSON alanları —————
export type FormData = {
  description?: string | null;
  sistem_adet?: string | null;
  sistem_genislik?: string | null;
  sistem_yukseklik?: string | null;
};

export type SummaryItem = {
  id: number;
  toplam_kg: string;           // "58.76 kg"
  cam_metraj: string;          // "7.92"
  sistem_metraj: string;       // "9.00"
  kayar_cam_adet: string;      // "3"
  kayar_cam_genislik: string;  // "2826"
  kayar_cam_yukseklik: string; // "934"
};

export type RawRow = {
  id: string;
  system_slug: string | null;
  form_data: unknown;
  summary_data: unknown;
  material_data: unknown;
  created_at?: string | null;
}

export type MaterialItem = {
  kesim_adet: number;
  profil_adi: string;
  profil_kodu: string;
  kesim_olcusu: string;
  profil_resmi: string;
  birim_agirlik: number;
  verilecek_adet: number;
};

// DataGrid satırı (id zorunlu) + hesaplanan alan
export type MaterialRow = MaterialItem & {
  id: string;
  toplam_agirlik: number;
};

// ————— Kart/istatistik tipleri —————
export type CountKey = 'total' | 'pending' | 'approved';
export type TrendDir = 'up' | 'down';

export type TrendValue = {
  change: number | null;
  trend: TrendDir;
};

export type RequestsTotals = {
  total: number;
  pending: number;
  approved: number;
};

export type RequestsTrends = Partial<Record<CountKey, TrendValue>>;
export type RequestsDeltas = Partial<Record<CountKey, number | null | undefined>>;
export type RequestsMonthlyAdds = Record<CountKey, number>;

export type RequestsCardsData = {
  totals: RequestsTotals;
  trends?: RequestsTrends;
  deltas?: RequestsDeltas;
  adds: RequestsMonthlyAdds;
};
