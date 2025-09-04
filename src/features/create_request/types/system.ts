// Supabase'den gelen ham profil
export type GiyotinProfil = {
  profil_resmi: string | null;   // ← string | null
  profil_kodu: string;
  profil_adi: string;
  birim_agirlik: number;
};

// Hesaplanmış profil satırı (DataGrid'te gösterilen)
export type GiyotinProfilHesapli = GiyotinProfil & {
  kesim_adet: number;
  kesim_olcusu: string;
  verilecek_adet: number;
};

// Özet tablo tipi
export type SistemOzet = {
  id: number;
  sistem_metraj: string;
  cam_metraj: string;
  kayar_cam_adet: string;
  kayar_cam_genislik: string;
  kayar_cam_yukseklik: string;
  toplam_kg: string;
};

// Ortak alanlar
export type BaseFormData = {
  description?: string;
};

// Sistem 1 – Giyotin Sistemi form tipi
export type GiyotinFormData = BaseFormData & {
  sistem_adet: string;
  sistem_yukseklik: string;
  sistem_genislik: string;
};

// Sistem 2 – Cam Balkon Sistemi form tipi (örnek)
export type CamBalkonFormData = BaseFormData & {
  panel_sayisi: string;
  kanat_genislik: string;
};

// ✅ Hesaplama fonksiyonu tipleri (generic)
export type SummaryCalculator<TForm extends BaseFormData = BaseFormData> = (
  form: TForm,
  rows2: GiyotinProfilHesapli[]
) => SistemOzet[];

export type MaterialCalculator<TForm extends BaseFormData = BaseFormData> = (
  form: TForm,
  profiles: GiyotinProfil[]
) => GiyotinProfilHesapli[];

// ✅ systemStep3Config tipi (generic)
import { GridColDef } from '@mui/x-data-grid';

export type KnownMaterialTable = 'system_profiles';
export type KnownMaterialFilter = 'system_slug';

export type SystemStep3Config<TForm extends BaseFormData> = {
  summaryColumns: GridColDef[];
  materialColumns: GridColDef[];
  supabaseTable: KnownMaterialTable;          // ← string değil, literal
  supabaseFilterColumn: KnownMaterialFilter;  // ← literal
  summaryCalculator: SummaryCalculator<TForm>;
  materialCalculator: MaterialCalculator<TForm>;
};
